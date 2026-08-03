export interface CaseCardData {
  title: string;
  tagline: string;
  image: string;
  href: string;
  external?: boolean;
  locked?: boolean;
}

/**
 * Order matches the source cases-grid (index.html:204-491). `locked` entries
 * point at sorry.html (no case study exists); `external` entries open work
 * hosted outside this site (rel/target handled by CaseCard).
 */
export const cases: CaseCardData[] = [
  { title: 'Impress', tagline: 'Streamline teeth alignment process', image: '/images/cases/impress.png', href: '/casestudy/impress-app.html' },
  { title: 'Idealista', tagline: 'Where brand meets user experience', image: '/images/cases/idealista.png', href: '/casestudy/idealista.html' },
  { title: 'Shares', tagline: 'Enhancing Shares app engagement', image: '/images/cases/snake.png', href: '/casestudy/snake.html' },
  { title: 'Yandex.Market', tagline: 'Refining mobile application', image: '/images/cases/marketapp.png', href: '/casestudy/market.html' },
  { title: 'Avito', tagline: 'Job search designed around first-time applicants', image: '/images/cases/aviapp.png', href: '/casestudy/avito.html' },
  { title: 'PepsiCo', tagline: 'Supply chain management service', image: '/images/cases/pepsi.png', href: '/casestudy/pepsi.html' },
  { title: 'Trew', tagline: 'Customer management service for coaches', image: '/images/cases/trew.png', href: '/sorry.html', locked: true },
  { title: 'TXPlanner', tagline: 'Teeth alignment design tool', image: '/images/cases/txplanner.png', href: '/sorry.html', locked: true },
  { title: 'Yandex.Market', tagline: 'A virtual assistant for e-commerce', image: '/images/cases/alice.png', href: '/sorry.html', locked: true },
  { title: 'Impress', tagline: 'Internal medical services', image: '/images/cases/backoffice.png', href: '/sorry.html', locked: true },
  {
    title: 'Liv',
    tagline: 'Tracker to Relieve Pain',
    image: '/images/cases/viv.png',
    href: 'https://apps.apple.com/ru/app/liv-happiness-companion/id1485409805?l=en',
    external: true,
  },
  { title: 'Yandex.Run', tagline: 'Music that follows the runner, not a preset playlist', image: '/images/cases/run.png', href: '/casestudy/run.html' },
  { title: 'Like VR', tagline: 'Development of virtual and augmented reality', image: '/images/cases/likevr.png', href: '/sorry.html', locked: true },
  { title: 'Rambler', tagline: 'Redesign of Rambler news main page', image: '/images/cases/rmblr.png', href: '/sorry.html', locked: true },
  { title: 'Mail.ru', tagline: 'Redesign the dashboard of the Cloud', image: '/images/cases/mail.png', href: '/sorry.html', locked: true },
  { title: 'The Book Aloud', tagline: 'Audiobook streaming service', image: '/images/cases/book.png', href: '/sorry.html', locked: true },
  { title: 'Yandex.Live', tagline: 'Live broadcasting platform', image: '/images/cases/live.png', href: '/sorry.html', locked: true },
  { title: 'Zvooq', tagline: 'Embeded player', image: '/images/cases/zvq.png', href: '/sorry.html', locked: true },
  {
    title: 'We.Study',
    tagline: 'A platform for organizing training sessions',
    image: '/images/cases/courses.png',
    href: 'https://we.study/',
    external: true,
  },
  {
    title: 'Webinar.ru',
    tagline: 'A platform for education, marketing and meetings',
    image: '/images/cases/webinar.png',
    href: 'https://webinar.ru/',
    external: true,
  },
  {
    title: 'AR Art Gallery',
    tagline: 'A platform for selling arts with augmented reality',
    image: '/images/cases/art.png',
    href: 'https://www.figma.com/proto/qW6gTNnCWCR7w6N4rgjbB7/Art-AR-(present)',
    external: true,
  },
  { title: 'ICO', tagline: 'ICO ratings from top investors', image: '/images/cases/ico.png', href: '/sorry.html', locked: true },
  { title: 'Marketplace X', tagline: 'A marketplace to buy and sell currency', image: '/images/cases/xchange.png', href: '/sorry.html', locked: true },
  {
    title: 'StudyFree',
    tagline: 'A platform to get a scholarship',
    image: '/images/cases/studyfree.png',
    href: 'https://platform.studyfree.com/login',
    external: true,
  },
];
