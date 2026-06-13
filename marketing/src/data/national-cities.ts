// National "coming soon" demand-capture cities — the expansion engine from
// CityPages.md §5. These pages rank for "shop local in [city]" nationwide and
// convert that intent into a weighted request to expand. A measured first wave
// (curated metros, each with a TRUE unique local hook); roll out further waves
// rather than publishing thousands at once. Mississippi is excluded here — it
// has its own seeded pages under /shop-local/mississippi/.
export interface NationalCity {
  slug: string;
  city: string;
  state: string; // full state name
  stateSlug: string;
  st: string; // 2-letter
  hook: string; // one genuinely true local detail (unique per city)
}

export interface NationalState {
  name: string;
  slug: string;
  st: string;
}

export const NATIONAL_CITIES: NationalCity[] = [
  // Tennessee
  { slug: 'memphis', city: 'Memphis', state: 'Tennessee', stateSlug: 'tennessee', st: 'TN', hook: 'the blues clubs of Beale Street and the independent shops and barbecue joints of Cooper-Young' },
  { slug: 'nashville', city: 'Nashville', state: 'Tennessee', stateSlug: 'tennessee', st: 'TN', hook: 'the honky-tonks of Broadway and the boutiques of East Nashville and the 12South strip' },
  { slug: 'knoxville', city: 'Knoxville', state: 'Tennessee', stateSlug: 'tennessee', st: 'TN', hook: 'the storefronts of Market Square downtown and the shops of the Old City' },
  { slug: 'chattanooga', city: 'Chattanooga', state: 'Tennessee', stateSlug: 'tennessee', st: 'TN', hook: 'the North Shore shops and the galleries of the Bluff View Art District' },
  // Alabama
  { slug: 'birmingham', city: 'Birmingham', state: 'Alabama', stateSlug: 'alabama', st: 'AL', hook: 'the restaurants of Avondale and Five Points South and the stalls of Pepper Place market' },
  { slug: 'mobile', city: 'Mobile', state: 'Alabama', stateSlug: 'alabama', st: 'AL', hook: 'the cafés of Dauphin Street and the home of the original American Mardi Gras' },
  { slug: 'montgomery', city: 'Montgomery', state: 'Alabama', stateSlug: 'alabama', st: 'AL', hook: 'the shops of Old Cloverdale and the revitalized storefronts along Dexter Avenue' },
  { slug: 'huntsville', city: 'Huntsville', state: 'Alabama', stateSlug: 'alabama', st: 'AL', hook: 'the makers around Lowe Mill and the shops of historic Twickenham' },
  // Louisiana
  { slug: 'new-orleans', city: 'New Orleans', state: 'Louisiana', stateSlug: 'louisiana', st: 'LA', hook: 'the boutiques of Magazine Street and the cafés of the Marigny and Frenchmen Street' },
  { slug: 'baton-rouge', city: 'Baton Rouge', state: 'Louisiana', stateSlug: 'louisiana', st: 'LA', hook: 'the shops of Mid City and the Saturday-morning Red Stick farmers market downtown' },
  { slug: 'shreveport', city: 'Shreveport', state: 'Louisiana', stateSlug: 'louisiana', st: 'LA', hook: 'the downtown arts district galleries and the shops along Line Avenue' },
  { slug: 'lafayette', city: 'Lafayette', state: 'Louisiana', stateSlug: 'louisiana', st: 'LA', hook: 'the Cajun and Creole kitchens and the shops of downtown and the Oil Center' },
  // Arkansas
  { slug: 'little-rock', city: 'Little Rock', state: 'Arkansas', stateSlug: 'arkansas', st: 'AR', hook: 'the River Market district downtown and the boutiques of the Heights and Hillcrest' },
  { slug: 'fayetteville', city: 'Fayetteville', state: 'Arkansas', stateSlug: 'arkansas', st: 'AR', hook: 'the Dickson Street shops and the Saturday farmers market on the downtown square' },
  // Georgia
  { slug: 'atlanta', city: 'Atlanta', state: 'Georgia', stateSlug: 'georgia', st: 'GA', hook: 'the shops along the BeltLine, Ponce City Market, and the storefronts of Little Five Points' },
  { slug: 'savannah', city: 'Savannah', state: 'Georgia', stateSlug: 'georgia', st: 'GA', hook: 'the boutiques of Broughton Street and the squares of the historic district' },
  // Texas
  { slug: 'houston', city: 'Houston', state: 'Texas', stateSlug: 'texas', st: 'TX', hook: 'the shops of the Heights and the galleries and kitchens of Montrose' },
  { slug: 'austin', city: 'Austin', state: 'Texas', stateSlug: 'texas', st: 'TX', hook: 'the South Congress strip and the local makers that keep Austin weird' },
  { slug: 'dallas', city: 'Dallas', state: 'Texas', stateSlug: 'texas', st: 'TX', hook: 'the shops of Bishop Arts and the galleries and storefronts of Deep Ellum' },
  { slug: 'san-antonio', city: 'San Antonio', state: 'Texas', stateSlug: 'texas', st: 'TX', hook: 'the shops of the Pearl district and the storefronts of Southtown' },
  // Florida
  { slug: 'orlando', city: 'Orlando', state: 'Florida', stateSlug: 'florida', st: 'FL', hook: "the boutiques of Winter Park's Park Avenue and the makers of the Mills 50 district" },
  { slug: 'tampa', city: 'Tampa', state: 'Florida', stateSlug: 'florida', st: 'FL', hook: 'the shops of Hyde Park Village and the historic storefronts of Ybor City' },
  { slug: 'miami', city: 'Miami', state: 'Florida', stateSlug: 'florida', st: 'FL', hook: 'the galleries of Wynwood and the boutiques of Little Havana and Coconut Grove' },
  { slug: 'jacksonville', city: 'Jacksonville', state: 'Florida', stateSlug: 'florida', st: 'FL', hook: 'the shops of Five Points and Riverside and the storefronts of San Marco square' },
];

export const NATIONAL_STATES: NationalState[] = Object.values(
  NATIONAL_CITIES.reduce<Record<string, NationalState>>((acc, c) => {
    acc[c.stateSlug] = { name: c.state, slug: c.stateSlug, st: c.st };
    return acc;
  }, {})
);

export function citiesInState(stateSlug: string): NationalCity[] {
  return NATIONAL_CITIES.filter((c) => c.stateSlug === stateSlug);
}

// Up to 3 sibling cities in the same state for internal linking.
export function nearbyNationalCities(city: NationalCity): NationalCity[] {
  return NATIONAL_CITIES.filter((c) => c.stateSlug === city.stateSlug && c.slug !== city.slug).slice(0, 3);
}
