export const contactEmail = "hello@picturethis-production.com";

/** Where the site's forms deliver. FormSubmit forwards each submission to the inbox above. */
export const formEndpoint = `https://formsubmit.co/ajax/${contactEmail}`;

/**
 * The online donation page (Zeffy). Leave empty until it is live: /donate/ then shows a
 * pledge form instead. Once set, /donate/ shows a "Donate online" button to this URL.
 */
export const donationUrl = "";
