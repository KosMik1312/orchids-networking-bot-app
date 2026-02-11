import json
import os
from typing import Dict, Any

# Путь к locales относительно расположения i18n.py (работает при любом CWD)
_DEFAULT_LOCALES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "locales")


class I18n:
    def __init__(self, locales_dir: str = None, default_lang: str = "ru"):
        self.locales_dir = locales_dir or _DEFAULT_LOCALES_DIR
        self.default_lang = default_lang
        self.translations: Dict[str, Dict[str, Any]] = {}
        self.load_locales()

    def load_locales(self):
        """Loads all JSON files from the locales directory."""
        if not os.path.exists(self.locales_dir):
            os.makedirs(self.locales_dir, exist_ok=True)
            return

        for filename in os.listdir(self.locales_dir):
            if filename.endswith(".json"):
                lang = filename[:-5]
                try:
                    with open(os.path.join(self.locales_dir, filename), "r", encoding="utf-8") as f:
                        self.translations[lang] = json.load(f)
                except Exception as e:
                    print(f"Error loading locale {filename}: {e}")

    def get(self, key: str, lang: str = None, **kwargs) -> str:
        """
        Retrieves a translation for the given key and language.
        Supports format placeholders (e.g., {name}).
        """
        lang = lang or self.default_lang
        
        # Fallback to default lang if requested lang not found
        if lang not in self.translations:
            lang = self.default_lang

        texts = self.translations.get(lang, {})
        value = texts.get(key)

        if value is None:
            # Fallback to default lang if key not found in requested lang
            if lang != self.default_lang:
                 value = self.translations.get(self.default_lang, {}).get(key)
            
            if value is None:
                return key  # Return key itself if not found anywhere

        try:
            return value.format(**kwargs)
        except KeyError:
            return value # Return unformatted string if args missing

# Global instance
i18n = I18n()
