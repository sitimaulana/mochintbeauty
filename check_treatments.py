#!/usr/bin/env python
import mysql.connector

conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='',
    database='beauty_clinic'
)

cur = conn.cursor(dictionary=True)
cur.execute('SELECT id, name, category, description FROM treatments')
treatments = cur.fetchall()

print("\nAll Treatments:")
print("=" * 100)
for t in treatments[:20]:
    print(f"\nID: {t['id']}")
    print(f"Name: {t['name']}")
    print(f"Category: {t['category']}")
    print(f"Description: {t['description'][:80] if t['description'] else 'N/A'}")

cur.close()
conn.close()
