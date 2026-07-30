export interface Testimonial {
  quote: string;
  author: string;
  href: string;
}

/**
 * Order matches the source testimonials grid (index.html:509-520). LinkedIn
 * recommendations, quoted verbatim — not the plan's typo-fix scope.
 */
export const testimonials: Testimonial[] = [
  {
    quote:
      "I had the opportunity to work with Jury twice (at Yandex and Impress) an in different design teams. So I can really recommend him as a top-notch designer who will care about your team, digital product and your users' experience.",
    author: 'Victor • Creative Product Designer',
    href: 'https://www.linkedin.com/in/j-alyavdin/#recommendations',
  },
  {
    quote:
      "One of Jury's most impressive qualities is his ability to inspire and mentor his team members. His leadership style fosters a collaborative and creative work environment where each team member feels empowered to contribute their best ideas.",
    author: 'Yerzhan • CTO',
    href: 'https://www.linkedin.com/in/j-alyavdin/#recommendations',
  },
  {
    quote:
      'He has exceptional skills as a product designer as well as a complex pack of soft skills which made him a great leader. He is a problem solving oriented person which matches perfectly his creativity of building cool, useful and impactful solutions.',
    author: 'Elena • Lead Product Manager',
    href: 'https://www.linkedin.com/in/j-alyavdin/#recommendations',
  },
];
