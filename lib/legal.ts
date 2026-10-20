import { business } from "./content";
import { flags, hasLegalIds } from "./flags";

/** "آخر تحديث" line, only when the owner set the date. */
export const legalUpdatedLine = flags.legalUpdated ? `آخر تحديث: ${flags.legalUpdated}` : null;

/** Company identity lines for the footer and the policies. */
export function legalIdentity() {
  return {
    name: business.fullName,
    ids: hasLegalIds ? { register: flags.commercialRegister, tax: flags.taxId } : null,
  };
}
