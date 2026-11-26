import { contactEmail, formEndpoint } from "../config";

/** Points every enquiry form in a design fragment at the configured endpoint and inbox. */
export function withEnquiryConfig(html: string): string {
  return html.replaceAll(
    'data-enquiry-form=""',
    `data-enquiry-form="" data-endpoint="${formEndpoint}" data-contact="${contactEmail}"`,
  );
}
