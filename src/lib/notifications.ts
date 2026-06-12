'use server'

// untuk kirim WhatsApp
export async function sendWhatsAppNotification(phone: string, message: string) {
  try {
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: { 
        "Authorization": process.env.WA_API_TOKEN as string 
      },
      body: new URLSearchParams({ 
        target: phone, 
        message: message 
      }),
    });

    const result = await response.json();
    console.log("Notifikasi WA terkirim:", result);
    return result;
    
  } catch (error) {
    console.error("Gagal kirim WA:", error);
    return { success: false };
  }
}