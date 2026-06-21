"""VOS Firebase site registry."""

SITES = [
    {
        "id":      "vitalos",
        "label":   "VitalOS Shell",
        "url":     "https://vitalos.web.app",
        "deploy":  "shell",
        "color":   "#6366f1",
    },
    {
        "id":      "fitness-vos",
        "label":   "Fitness Remote",
        "url":     "https://fitness-vos.web.app",
        "deploy":  "fitness",
        "color":   "#3b82f6",
    },
    {
        "id":      "fuel-vos",
        "label":   "Fuel Remote",
        "url":     "https://fuel-vos.web.app",
        "deploy":  "fuel",
        "color":   "#f97316",
    },
    {
        "id":      "journal-aos",
        "label":   "Journal Remote",
        "url":     "https://journal-aos.web.app",
        "deploy":  "journal",
        "color":   "#8b5cf6",
    },
    {
        "id":      "learn-vos",
        "label":   "Learn Remote",
        "url":     "https://learn-vos.web.app",
        "deploy":  "learn",
        "color":   "#10b981",
    },
    {
        "id":      "fitness-aos",
        "label":   "Fitness PWA (standalone)",
        "url":     "https://fitness-aos.web.app",
        "deploy":  None,
        "color":   "#64748b",
    },
]

FIREBASE_PROJECT = "fitness-aos"
