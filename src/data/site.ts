export interface SocialLink {
  /** Network name, used in the accessible label. */
  name: string;
  href: string;
  /** Icon file under /images/social/ — rendered as a CSS background, as in the source. */
  icon: string;
}

export const site = {
  name: 'Jury Alyavdin',
  email: 'mail@j-alyavdin.com',
  origin: 'https://j-alyavdin.com',
} as const;

/** Order matches the source header/footer blocks (index.html:57-62). */
export const social: SocialLink[] = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/j-alyavdin/',
    icon: '/images/social/linkedin-icon.png',
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/j.alyavdin/',
    icon: '/images/social/facebook-icon.png',
  },
  {
    name: 'Dribbble',
    href: 'https://dribbble.com/flip_sorry',
    icon: '/images/social/dribbble-icon.png',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/facetoplace/',
    icon: '/images/social/instagram-icon.png',
  },
];
