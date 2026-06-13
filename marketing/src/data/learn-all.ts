// The full /learn set: the original extracted articles plus the structured
// additions. Both share the LearnArticle shape, so the hub and the [slug]
// template render them identically.
import { LEARN_ARTICLES, type LearnArticle } from './learn';
import { EXTRA_LEARN } from './learn-extra';
import { PARTNER_LEARN } from './learn-partner';

export type { LearnArticle };
export const ALL_LEARN: LearnArticle[] = [...LEARN_ARTICLES, ...EXTRA_LEARN, ...PARTNER_LEARN];
