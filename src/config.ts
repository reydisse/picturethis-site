export const contactEmail = "hello@picturethis-production.com";

/**
 * Where the site's forms deliver: the Pages Function in functions/api/enquiry.js. It emails
 * the inbox above through Resend and sends the person an acknowledgement chosen by `interest`.
 */
export const formEndpoint = "/api/enquiry";

/**
 * The online donation page (Zeffy). Leave empty until it is live: /donate/ then shows a
 * pledge form instead. Once set, /donate/ shows a "Donate online" button to this URL.
 */
export const donationUrl = "";
