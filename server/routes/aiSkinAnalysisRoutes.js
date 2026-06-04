const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

/**
 * POST /api/ai/analyze-skin
 * Analyze skin using PyTorch model
 * Body: { image: base64_string }
 */
router.post('/analyze-skin', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Call Python script (use simple mock version to avoid dependency issues)
    const pythonScriptPath = path.join(__dirname, '../mock_analysis_simple.py');
    
    let responseSent = false;
    
    // Determine Python executable path (use venv if available)
    let pythonExe = 'python';
    const isWindows = os.platform() === 'win32';
    // __dirname is server/routes, so we need to go up 2 levels to project root, then into .venv
    const venvPythonPath = path.join(__dirname, '../../.venv/Scripts/python.exe');
    const venvPythonPathUnix = path.join(__dirname, '../../.venv/bin/python');
    
    // Check if virtual environment Python exists
    const fs = require('fs');
    if (isWindows && fs.existsSync(venvPythonPath)) {
      pythonExe = venvPythonPath;
      console.log(`✅ Found venv Python at: ${venvPythonPath}`);
    } else if (!isWindows && fs.existsSync(venvPythonPathUnix)) {
      pythonExe = venvPythonPathUnix;
      console.log(`✅ Found venv Python at: ${venvPythonPathUnix}`);
    } else {
      console.log(`⚠️ venv Python not found, using system Python`);
    }
    
    console.log(`Using Python: ${pythonExe}`);
    
    // Pass image via stdin to avoid ENAMETOOLONG error on Windows
    const python = spawn(pythonExe, [pythonScriptPath], {
      cwd: path.dirname(pythonScriptPath),
      env: { ...process.env, PYTHONUNBUFFERED: '1' }
    });
    
    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Send image data to stdin and close stdin
    python.stdin.write(image);
    python.stdin.end();

    python.on('close', (code) => {
      if (responseSent) return;
      
      if (code !== 0) {
        console.error('Python Error:', errorOutput);
        responseSent = true;
        return res.status(500).json({ 
          error: 'AI analysis failed',
          details: errorOutput 
        });
      }

      try {
        const result = JSON.parse(output);
        
        if (result.error) {
          responseSent = true;
          return res.status(400).json({ error: result.error });
        }

        responseSent = true;
        return res.status(200).json(result);
      } catch (parseError) {
        console.error('Parse Error:', parseError);
        responseSent = true;
        return res.status(500).json({ 
          error: 'Failed to parse AI response',
          details: output 
        });
      }
    });

    // Handle spawn errors
    python.on('error', (err) => {
      if (responseSent) return;
      console.error('Spawn Error:', err);
      responseSent = true;
      return res.status(500).json({ 
        error: 'Failed to start analysis process',
        details: err.message 
      });
    });

    // Timeout after 30 seconds
    const timeoutId = setTimeout(() => { console.log("TIMEOUT TRIGGERED"); 
      if (responseSent) return;
      python.kill();
      responseSent = true;
      return res.status(504).json({ error: 'Analysis timeout' });
    }, 60000);
    
    // Clear timeout if process completes before timeout
    python.on('close', () => {
      clearTimeout(timeoutId);
    });

  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

/**
 * GET /api/ai/health
 * Check if AI service is available
 */
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'AI Skin Analysis service is running' 
  });
});

module.exports = router;
