// WhatsApp links with a ready message, so the customer only fills in the machine and the fault.
import { business } from "./content";

export const GENERAL_WA_MESSAGE = "السلام عليكم، لدي معدة تحتاج إلى صيانة.\nنوع المعدة: \nالعطل: ";

export const serviceWaMessage = (serviceTitle: string) =>
  `السلام عليكم، أحتاج إلى خدمة «${serviceTitle}».\nنوع المعدة: \nالعطل: `;

export function whatsappLink(message: string = GENERAL_WA_MESSAGE): string {
  return `${business.whatsapp}?text=${encodeURIComponent(message)}`;
}
