import re

with open('src/views/InscriptionSoutienScolaire.vue', 'r') as f:
    content = f.read()

# 1. Update step labels
old_labels = """const stepLabels = [
  "Identité",
  "Détails",
  "Parents",
  "Adresse",
  "Niveau",
  "Matière",
  "Créneau",
  "Validation"
]"""

new_labels = """const stepLabels = [
  "Identité",
  "Parents",
  "Adresse",
  "Niveau",
  "Matière",
  "Créneau",
  "Validation"
]"""
content = content.replace(old_labels, new_labels)

# 2. Extract and replace HTML blocks
# I need to combine Step 0 and Step 1 HTML into one block and renumber the rest.
