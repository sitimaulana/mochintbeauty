-- Add skin_type and skin_condition columns to treatments table
-- This allows filtering treatments based on detected skin type and condition

ALTER TABLE treatments ADD COLUMN skin_type VARCHAR(50) DEFAULT NULL COMMENT 'Target skin type: Kering, Berminyak, Kombinasi, Sensitif, Normal, Berjerawat, Kusam';

ALTER TABLE treatments ADD COLUMN skin_condition VARCHAR(100) DEFAULT NULL COMMENT 'Target skin condition: acne, blackheads, dark spots, pores, redness, wrinkles, or comma-separated for multiple';

-- Create indexes for faster queries
CREATE INDEX idx_skin_type ON treatments(skin_type);
CREATE INDEX idx_skin_condition ON treatments(skin_condition);
