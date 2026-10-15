import type { CareerTrack } from "./careerTracks";

export interface PartnerLogo {
  /** path under public/, for light backgrounds */
  light: string;
  /** path under public/, for dark backgrounds; omit when the light logo reads on both */
  dark?: string;
  /** empty when `wordmark` already names the partner beside the logo */
  alt: string;
  /** intrinsic size, so the browser reserves space before the image loads */
  width: number;
  height: number;
  /** visible name set in our font, for logos that carry no wordmark of their own */
  wordmark?: string;
}

export interface LearningPartner {
  id: string;
  name: string;
  logo: PartnerLogo;
  /** what SLINT Tech learners get */
  title: string;
  description: string;
  /** career tracks the platform is used in, by `CareerTrack.id` */
  trackIds: CareerTrack["id"][];
}

/** Learning platforms our learners get access to, in display order. */
export const learningPartners: LearningPartner[] = [
  {
    id: "datacamp",
    name: "DataCamp",
    logo: {
      light: "/partners/datacamp-donates.png",
      dark: "/partners/datacamp-donates-inverted.png",
      alt: "DataCamp Donates",
      width: 640,
      height: 176,
    },
    title: "Free DataCamp access",
    description:
      "Through DataCamp Donates, eligible SLINT Tech learners get free access to DataCamp's courses and projects in data, AI and analytics.",
    trackIds: ["data-analysis", "data-science", "ai-machine-learning"],
  },
  {
    id: "scrimba",
    name: "Scrimba",
    logo: {
      light: "/partners/scrimba-icon.png",
      alt: "",
      width: 200,
      height: 200,
      wordmark: "Scrimba",
    },
    title: "Discounted Scrimba Pro",
    description:
      "SLINT Tech learners can subscribe to Scrimba Pro, monthly or yearly, at a partner discount and learn to code through interactive screencasts.",
    trackIds: ["software-engineering"],
  },
];
