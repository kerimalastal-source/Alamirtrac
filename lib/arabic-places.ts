// Arabic names for the places Vercel reports (country code and an English city
// name), so Telegram alerts and the statistics page read fully in Arabic. A city
// that is not listed keeps the name Vercel sent.
const regionNames = new Intl.DisplayNames(["ar"], { type: "region" });

export function countryAr(code: string | null | undefined): string {
  if (!code) return "غير معروف";
  try {
    return regionNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

const plain = (city: string) =>
  city.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[-_.']/g, " ").replace(/\s+/g, " ").trim().toLowerCase();

const CITIES: Record<string, string> = {
  // مصر
  cairo: "القاهرة", giza: "الجيزة", alexandria: "الإسكندرية", "shubra el kheima": "شبرا الخيمة", "port said": "بورسعيد",
  suez: "السويس", luxor: "الأقصر", aswan: "أسوان", mansoura: "المنصورة", "el mansura": "المنصورة", tanta: "طنطا",
  asyut: "أسيوط", assiut: "أسيوط", ismailia: "الإسماعيلية", faiyum: "الفيوم", fayoum: "الفيوم", zagazig: "الزقازيق",
  damietta: "دمياط", minya: "المنيا", "el minya": "المنيا", "beni suef": "بني سويف", hurghada: "الغردقة",
  "sharm el sheikh": "شرم الشيخ", "6th of october city": "مدينة 6 أكتوبر", "6th of october": "مدينة 6 أكتوبر",
  "new cairo": "القاهرة الجديدة", obour: "العبور", "10th of ramadan city": "مدينة العاشر من رمضان", helwan: "حلوان",
  damanhur: "دمنهور", "kafr el sheikh": "كفر الشيخ", banha: "بنها", sohag: "سوهاج", qena: "قنا", "el arish": "العريش",
  "marsa matruh": "مرسى مطروح", "el mahalla el kubra": "المحلة الكبرى", "shibin el kom": "شبين الكوم", "badr city": "مدينة بدر",
  // السعودية
  riyadh: "الرياض", jeddah: "جدة", mecca: "مكة المكرمة", medina: "المدينة المنورة", dammam: "الدمام", khobar: "الخبر",
  "al khobar": "الخبر", tabuk: "تبوك", abha: "أبها", buraydah: "بريدة", "khamis mushait": "خميس مشيط", taif: "الطائف",
  jubail: "الجبيل", yanbu: "ينبع", hail: "حائل", najran: "نجران", jazan: "جازان",
  // الخليج
  dubai: "دبي", "abu dhabi": "أبوظبي", sharjah: "الشارقة", ajman: "عجمان", "al ain": "العين", "ras al khaimah": "رأس الخيمة",
  fujairah: "الفجيرة", "kuwait city": "مدينة الكويت", doha: "الدوحة", manama: "المنامة", muscat: "مسقط",
  // بلاد الشام والعراق واليمن
  amman: "عمّان", zarqa: "الزرقاء", irbid: "إربد", beirut: "بيروت", baghdad: "بغداد", basra: "البصرة", erbil: "أربيل",
  damascus: "دمشق", aleppo: "حلب", sanaa: "صنعاء", aden: "عدن", gaza: "غزة", ramallah: "رام الله", jerusalem: "القدس",
  // شمال أفريقيا والسودان
  tripoli: "طرابلس", benghazi: "بنغازي", misrata: "مصراتة", khartoum: "الخرطوم", omdurman: "أم درمان",
  tunis: "تونس", sfax: "صفاقس", algiers: "الجزائر", oran: "وهران", casablanca: "الدار البيضاء", rabat: "الرباط",
  marrakesh: "مراكش", marrakech: "مراكش", fes: "فاس", tangier: "طنجة", nouakchott: "نواكشوط",
  // أخرى
  istanbul: "إسطنبول", ankara: "أنقرة", london: "لندن", paris: "باريس", berlin: "برلين", frankfurt: "فرانكفورت",
  amsterdam: "أمستردام", dublin: "دبلن", madrid: "مدريد", rome: "روما", "new york": "نيويورك", "los angeles": "لوس أنجلوس",
  ashburn: "أشبورن", toronto: "تورونتو", mumbai: "مومباي", delhi: "دلهي", karachi: "كراتشي", moscow: "موسكو",
};

export function cityAr(city: string | null | undefined): string | null {
  if (!city) return null;
  return CITIES[plain(city)] ?? city;
}

/** "القاهرة، مصر". */
export function placeAr(city: string | null | undefined, country: string | null | undefined): string {
  return [cityAr(city), country ? countryAr(country) : null].filter(Boolean).join("، ") || "غير معروف";
}
