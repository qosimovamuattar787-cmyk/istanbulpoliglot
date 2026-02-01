
import os
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes

# DIQQAT: Bot Tokenni xavfsizlik uchun environment variable orqali olish tavsiya etiladi
# Yoki shu yerning o'ziga vaqtincha yozishingiz mumkin
BOT_TOKEN = "8288887280:AAFukqA3Z9_LNFkyTGsiJ5l0WEsdYvBigno" 
WEBAPP_URL = "YOUR_VERCEL_DEPLOYMENT_URL"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """/start komandasi kelganda WebApp tugmasini yuboradi."""
    keyboard = [
        [
            InlineKeyboardButton(
                text="🌍 Quizni Boshlash (AI)", 
                web_app=WebAppInfo(url=WEBAPP_URL)
            )
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    welcome_text = (
        "👋 Salom! Istanbul Poliglot Botiga xush kelibsiz.\n\n"
        "Men sizga Gemini AI yordamida interaktiv til quizlari "
        "yaratishda yordam beraman. Boshlash uchun pastdagi tugmani bosing!"
    )
    
    await update.message.reply_text(welcome_text, reply_markup=reply_markup)

def main():
    if BOT_TOKEN == "8288887280:AAFukqA3Z9_LNFkyTGsiJ5l0WEsdYvBigno":
        print("Xatolik: Iltimos, bot.py ichiga o'z bot tokeningizni yozing!")
        return

    # Botni yaratish va start handlerini qo'shish
    application = Application.builder().token(BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    
    print("Bot ishlamoqda... (Polling)")
    application.run_polling()

if __name__ == '__main__':
    main()
