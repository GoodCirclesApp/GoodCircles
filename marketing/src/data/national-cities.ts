// National "coming soon" demand-capture cities — the expansion engine from
// CityPages.md §5, scaled to the top metros in all 50 states + Washington, D.C.
// These pages rank for "shop local in [city]" nationwide and convert intent
// into weighted expansion requests (cities/states competing to be next).
//
// THIN-CONTENT DISCIPLINE: every entry carries a TRUE, unique local hook (a
// well-known district / downtown / market / landmark). No fabricated detail.
// Mississippi is excluded — it has its own seeded pages under
// /shop-local/mississippi/ (different route, takes priority).
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
  // Alabama
  { slug: 'birmingham', city: 'Birmingham', state: 'Alabama', stateSlug: 'alabama', st: 'AL', hook: 'the restaurants of Avondale and Five Points South and the stalls of Pepper Place market' },
  { slug: 'mobile', city: 'Mobile', state: 'Alabama', stateSlug: 'alabama', st: 'AL', hook: 'the cafés of Dauphin Street and the home of the original American Mardi Gras' },
  { slug: 'montgomery', city: 'Montgomery', state: 'Alabama', stateSlug: 'alabama', st: 'AL', hook: 'the shops of Old Cloverdale and the revitalized storefronts along Dexter Avenue' },
  { slug: 'huntsville', city: 'Huntsville', state: 'Alabama', stateSlug: 'alabama', st: 'AL', hook: 'the makers around Lowe Mill and the shops of historic Twickenham' },
  // Alaska
  { slug: 'anchorage', city: 'Anchorage', state: 'Alaska', stateSlug: 'alaska', st: 'AK', hook: 'the downtown shops along Fourth Avenue and the weekend market on the edge of town' },
  { slug: 'fairbanks', city: 'Fairbanks', state: 'Alaska', stateSlug: 'alaska', st: 'AK', hook: 'the locally owned shops of downtown and the businesses along the Chena riverfront' },
  // Arizona
  { slug: 'phoenix', city: 'Phoenix', state: 'Arizona', stateSlug: 'arizona', st: 'AZ', hook: 'the galleries and makers of the Roosevelt Row arts district downtown' },
  { slug: 'tucson', city: 'Tucson', state: 'Arizona', stateSlug: 'arizona', st: 'AZ', hook: 'the shops and cafés of Fourth Avenue and the historic downtown' },
  { slug: 'scottsdale', city: 'Scottsdale', state: 'Arizona', stateSlug: 'arizona', st: 'AZ', hook: 'the galleries and boutiques of Old Town Scottsdale' },
  { slug: 'flagstaff', city: 'Flagstaff', state: 'Arizona', stateSlug: 'arizona', st: 'AZ', hook: 'the historic downtown storefronts along old Route 66' },
  // Arkansas
  { slug: 'little-rock', city: 'Little Rock', state: 'Arkansas', stateSlug: 'arkansas', st: 'AR', hook: 'the River Market district downtown and the boutiques of the Heights and Hillcrest' },
  { slug: 'fayetteville', city: 'Fayetteville', state: 'Arkansas', stateSlug: 'arkansas', st: 'AR', hook: 'the Dickson Street shops and the Saturday farmers market on the downtown square' },
  { slug: 'bentonville', city: 'Bentonville', state: 'Arkansas', stateSlug: 'arkansas', st: 'AR', hook: 'the makers and cafés around the downtown square' },
  // California
  { slug: 'los-angeles', city: 'Los Angeles', state: 'California', stateSlug: 'california', st: 'CA', hook: 'the boutiques of Silver Lake and Abbot Kinney Boulevard in Venice' },
  { slug: 'san-francisco', city: 'San Francisco', state: 'California', stateSlug: 'california', st: 'CA', hook: 'the shops of the Mission District and Hayes Valley' },
  { slug: 'san-diego', city: 'San Diego', state: 'California', stateSlug: 'california', st: 'CA', hook: 'the makers of Little Italy and the storefronts of North Park' },
  { slug: 'sacramento', city: 'Sacramento', state: 'California', stateSlug: 'california', st: 'CA', hook: 'the shops and cafés of Midtown' },
  { slug: 'san-jose', city: 'San Jose', state: 'California', stateSlug: 'california', st: 'CA', hook: 'the storefronts of downtown and the shops of Santana Row' },
  { slug: 'oakland', city: 'Oakland', state: 'California', stateSlug: 'california', st: 'CA', hook: 'the makers of Temescal and the storefronts of Old Oakland' },
  { slug: 'fresno', city: 'Fresno', state: 'California', stateSlug: 'california', st: 'CA', hook: 'the independent shops and theaters of the Tower District' },
  { slug: 'long-beach', city: 'Long Beach', state: 'California', stateSlug: 'california', st: 'CA', hook: 'the vintage shops of Retro Row on 4th Street' },
  // Colorado
  { slug: 'denver', city: 'Denver', state: 'Colorado', stateSlug: 'colorado', st: 'CO', hook: 'the galleries of the RiNo arts district and the shops of South Broadway' },
  { slug: 'colorado-springs', city: 'Colorado Springs', state: 'Colorado', stateSlug: 'colorado', st: 'CO', hook: 'the storefronts of downtown and historic Old Colorado City' },
  { slug: 'boulder', city: 'Boulder', state: 'Colorado', stateSlug: 'colorado', st: 'CO', hook: 'the shops and cafés of the Pearl Street pedestrian mall' },
  { slug: 'fort-collins', city: 'Fort Collins', state: 'Colorado', stateSlug: 'colorado', st: 'CO', hook: 'the independent storefronts of historic Old Town' },
  // Connecticut
  { slug: 'new-haven', city: 'New Haven', state: 'Connecticut', stateSlug: 'connecticut', st: 'CT', hook: 'the shops around the Green and along Chapel Street' },
  { slug: 'hartford', city: 'Hartford', state: 'Connecticut', stateSlug: 'connecticut', st: 'CT', hook: 'the locally owned storefronts of downtown and the West End' },
  { slug: 'stamford', city: 'Stamford', state: 'Connecticut', stateSlug: 'connecticut', st: 'CT', hook: 'the shops and restaurants of downtown' },
  // Delaware
  { slug: 'wilmington', city: 'Wilmington', state: 'Delaware', stateSlug: 'delaware', st: 'DE', hook: 'the shops and restaurants along Market Street downtown' },
  { slug: 'newark', city: 'Newark', state: 'Delaware', stateSlug: 'delaware', st: 'DE', hook: 'the independent storefronts of Main Street near the university' },
  // Florida
  { slug: 'jacksonville', city: 'Jacksonville', state: 'Florida', stateSlug: 'florida', st: 'FL', hook: 'the shops of Five Points and Riverside and the storefronts of San Marco square' },
  { slug: 'miami', city: 'Miami', state: 'Florida', stateSlug: 'florida', st: 'FL', hook: 'the galleries of Wynwood and the boutiques of Little Havana and Coconut Grove' },
  { slug: 'tampa', city: 'Tampa', state: 'Florida', stateSlug: 'florida', st: 'FL', hook: 'the shops of Hyde Park Village and the historic storefronts of Ybor City' },
  { slug: 'orlando', city: 'Orlando', state: 'Florida', stateSlug: 'florida', st: 'FL', hook: "the boutiques of Winter Park's Park Avenue and the makers of the Mills 50 district" },
  { slug: 'st-petersburg', city: 'St. Petersburg', state: 'Florida', stateSlug: 'florida', st: 'FL', hook: 'the galleries and shops of the downtown arts district' },
  { slug: 'tallahassee', city: 'Tallahassee', state: 'Florida', stateSlug: 'florida', st: 'FL', hook: 'the locally owned shops of Midtown and the downtown district' },
  // Georgia
  { slug: 'atlanta', city: 'Atlanta', state: 'Georgia', stateSlug: 'georgia', st: 'GA', hook: 'the shops along the BeltLine, Ponce City Market, and the storefronts of Little Five Points' },
  { slug: 'savannah', city: 'Savannah', state: 'Georgia', stateSlug: 'georgia', st: 'GA', hook: 'the boutiques of Broughton Street and the squares of the historic district' },
  { slug: 'athens', city: 'Athens', state: 'Georgia', stateSlug: 'georgia', st: 'GA', hook: 'the record shops, cafés, and storefronts of downtown near the university' },
  { slug: 'augusta', city: 'Augusta', state: 'Georgia', stateSlug: 'georgia', st: 'GA', hook: 'the shops along Broad Street in the downtown arts district' },
  // Hawaii
  { slug: 'honolulu', city: 'Honolulu', state: 'Hawaii', stateSlug: 'hawaii', st: 'HI', hook: 'the galleries of the Chinatown arts district and the shops of Kaimuki' },
  { slug: 'hilo', city: 'Hilo', state: 'Hawaii', stateSlug: 'hawaii', st: 'HI', hook: 'the historic bayfront storefronts of downtown' },
  // Idaho
  { slug: 'boise', city: 'Boise', state: 'Idaho', stateSlug: 'idaho', st: 'ID', hook: 'the shops and makers of downtown and the BoDo district' },
  { slug: 'idaho-falls', city: 'Idaho Falls', state: 'Idaho', stateSlug: 'idaho', st: 'ID', hook: 'the locally owned shops of historic downtown along the river' },
  // Illinois
  { slug: 'chicago', city: 'Chicago', state: 'Illinois', stateSlug: 'illinois', st: 'IL', hook: 'the boutiques of Wicker Park and the storefronts of Andersonville' },
  { slug: 'springfield', city: 'Springfield', state: 'Illinois', stateSlug: 'illinois', st: 'IL', hook: 'the locally owned shops of the historic downtown' },
  { slug: 'naperville', city: 'Naperville', state: 'Illinois', stateSlug: 'illinois', st: 'IL', hook: 'the shops and cafés along the downtown Riverwalk' },
  { slug: 'peoria', city: 'Peoria', state: 'Illinois', stateSlug: 'illinois', st: 'IL', hook: 'the storefronts of the Warehouse District downtown' },
  // Indiana
  { slug: 'indianapolis', city: 'Indianapolis', state: 'Indiana', stateSlug: 'indiana', st: 'IN', hook: 'the shops of Mass Ave and the makers of Fountain Square' },
  { slug: 'fort-wayne', city: 'Fort Wayne', state: 'Indiana', stateSlug: 'indiana', st: 'IN', hook: 'the locally owned storefronts of downtown and the West Central district' },
  { slug: 'bloomington', city: 'Bloomington', state: 'Indiana', stateSlug: 'indiana', st: 'IN', hook: 'the shops around the courthouse square near the university' },
  // Iowa
  { slug: 'des-moines', city: 'Des Moines', state: 'Iowa', stateSlug: 'iowa', st: 'IA', hook: 'the boutiques and cafés of the East Village' },
  { slug: 'cedar-rapids', city: 'Cedar Rapids', state: 'Iowa', stateSlug: 'iowa', st: 'IA', hook: 'the storefronts of the NewBo and Czech Village districts' },
  { slug: 'iowa-city', city: 'Iowa City', state: 'Iowa', stateSlug: 'iowa', st: 'IA', hook: 'the shops of the downtown pedestrian mall near the university' },
  // Kansas
  { slug: 'wichita', city: 'Wichita', state: 'Kansas', stateSlug: 'kansas', st: 'KS', hook: 'the shops and restaurants of Old Town and the Delano district' },
  { slug: 'kansas-city', city: 'Kansas City', state: 'Kansas', stateSlug: 'kansas', st: 'KS', hook: 'the locally owned storefronts of downtown and Strawberry Hill' },
  { slug: 'lawrence', city: 'Lawrence', state: 'Kansas', stateSlug: 'kansas', st: 'KS', hook: 'the independent shops along Massachusetts Street downtown' },
  // Kentucky
  { slug: 'louisville', city: 'Louisville', state: 'Kentucky', stateSlug: 'kentucky', st: 'KY', hook: 'the shops of NuLu on East Market and the storefronts along Bardstown Road' },
  { slug: 'lexington', city: 'Lexington', state: 'Kentucky', stateSlug: 'kentucky', st: 'KY', hook: 'the storefronts of downtown and the Distillery District' },
  // Louisiana
  { slug: 'new-orleans', city: 'New Orleans', state: 'Louisiana', stateSlug: 'louisiana', st: 'LA', hook: 'the boutiques of Magazine Street and the cafés of the Marigny and Frenchmen Street' },
  { slug: 'baton-rouge', city: 'Baton Rouge', state: 'Louisiana', stateSlug: 'louisiana', st: 'LA', hook: 'the shops of Mid City and the Saturday-morning Red Stick farmers market downtown' },
  { slug: 'shreveport', city: 'Shreveport', state: 'Louisiana', stateSlug: 'louisiana', st: 'LA', hook: 'the downtown arts district galleries and the shops along Line Avenue' },
  { slug: 'lafayette', city: 'Lafayette', state: 'Louisiana', stateSlug: 'louisiana', st: 'LA', hook: 'the Cajun and Creole kitchens and the shops of downtown and the Oil Center' },
  // Maine
  { slug: 'portland', city: 'Portland', state: 'Maine', stateSlug: 'maine', st: 'ME', hook: 'the boutiques, galleries, and restaurants of the Old Port' },
  { slug: 'bangor', city: 'Bangor', state: 'Maine', stateSlug: 'maine', st: 'ME', hook: 'the locally owned shops of the historic downtown' },
  // Maryland
  { slug: 'baltimore', city: 'Baltimore', state: 'Maryland', stateSlug: 'maryland', st: 'MD', hook: 'the shops of Hampden’s "the Avenue" and the storefronts of Fells Point' },
  { slug: 'annapolis', city: 'Annapolis', state: 'Maryland', stateSlug: 'maryland', st: 'MD', hook: 'the boutiques along Main Street near the harbor' },
  { slug: 'frederick', city: 'Frederick', state: 'Maryland', stateSlug: 'maryland', st: 'MD', hook: 'the shops and galleries of the historic downtown' },
  // Massachusetts
  { slug: 'boston', city: 'Boston', state: 'Massachusetts', stateSlug: 'massachusetts', st: 'MA', hook: 'the storefronts of the North End and the boutiques of Newbury Street' },
  { slug: 'cambridge', city: 'Cambridge', state: 'Massachusetts', stateSlug: 'massachusetts', st: 'MA', hook: 'the shops of Harvard Square and Central Square' },
  { slug: 'worcester', city: 'Worcester', state: 'Massachusetts', stateSlug: 'massachusetts', st: 'MA', hook: 'the locally owned storefronts of downtown and the Canal District' },
  // Michigan
  { slug: 'detroit', city: 'Detroit', state: 'Michigan', stateSlug: 'michigan', st: 'MI', hook: 'the storefronts of Corktown and the stalls of Eastern Market' },
  { slug: 'grand-rapids', city: 'Grand Rapids', state: 'Michigan', stateSlug: 'michigan', st: 'MI', hook: 'the shops of downtown and the markets along the river' },
  { slug: 'ann-arbor', city: 'Ann Arbor', state: 'Michigan', stateSlug: 'michigan', st: 'MI', hook: 'the shops of Main Street and the Kerrytown market district' },
  // Minnesota
  { slug: 'minneapolis', city: 'Minneapolis', state: 'Minnesota', stateSlug: 'minnesota', st: 'MN', hook: 'the makers of the Northeast arts district and the shops of Uptown' },
  { slug: 'saint-paul', city: 'Saint Paul', state: 'Minnesota', stateSlug: 'minnesota', st: 'MN', hook: 'the storefronts of Grand Avenue' },
  { slug: 'duluth', city: 'Duluth', state: 'Minnesota', stateSlug: 'minnesota', st: 'MN', hook: 'the shops of Canal Park along the lakefront' },
  // Missouri
  { slug: 'kansas-city', city: 'Kansas City', state: 'Missouri', stateSlug: 'missouri', st: 'MO', hook: 'the makers of the Crossroads and the shops of Westport' },
  { slug: 'st-louis', city: 'St. Louis', state: 'Missouri', stateSlug: 'missouri', st: 'MO', hook: 'the shops of the Delmar Loop and the storefronts of Cherokee Street' },
  { slug: 'springfield', city: 'Springfield', state: 'Missouri', stateSlug: 'missouri', st: 'MO', hook: 'the locally owned shops of downtown and the historic Commercial Street district' },
  { slug: 'columbia', city: 'Columbia', state: 'Missouri', stateSlug: 'missouri', st: 'MO', hook: 'the shops of the downtown district near the university' },
  // Montana
  { slug: 'billings', city: 'Billings', state: 'Montana', stateSlug: 'montana', st: 'MT', hook: 'the locally owned storefronts of historic downtown' },
  { slug: 'missoula', city: 'Missoula', state: 'Montana', stateSlug: 'montana', st: 'MT', hook: 'the shops of the Hip Strip and the downtown district' },
  { slug: 'bozeman', city: 'Bozeman', state: 'Montana', stateSlug: 'montana', st: 'MT', hook: 'the independent shops along Main Street downtown' },
  // Nebraska
  { slug: 'omaha', city: 'Omaha', state: 'Nebraska', stateSlug: 'nebraska', st: 'NE', hook: 'the shops and restaurants of the historic Old Market' },
  { slug: 'lincoln', city: 'Lincoln', state: 'Nebraska', stateSlug: 'nebraska', st: 'NE', hook: 'the storefronts of the Haymarket district downtown' },
  // Nevada
  { slug: 'las-vegas', city: 'Las Vegas', state: 'Nevada', stateSlug: 'nevada', st: 'NV', hook: 'the galleries and makers of the downtown Arts District' },
  { slug: 'reno', city: 'Reno', state: 'Nevada', stateSlug: 'nevada', st: 'NV', hook: 'the shops and cafés of the Midtown district' },
  { slug: 'henderson', city: 'Henderson', state: 'Nevada', stateSlug: 'nevada', st: 'NV', hook: 'the storefronts of the Water Street District downtown' },
  // New Hampshire
  { slug: 'manchester', city: 'Manchester', state: 'New Hampshire', stateSlug: 'new-hampshire', st: 'NH', hook: 'the shops and restaurants along Elm Street downtown' },
  { slug: 'portsmouth', city: 'Portsmouth', state: 'New Hampshire', stateSlug: 'new-hampshire', st: 'NH', hook: 'the boutiques and cafés around Market Square' },
  // New Jersey
  { slug: 'jersey-city', city: 'Jersey City', state: 'New Jersey', stateSlug: 'new-jersey', st: 'NJ', hook: 'the shops of downtown and along Newark Avenue' },
  { slug: 'princeton', city: 'Princeton', state: 'New Jersey', stateSlug: 'new-jersey', st: 'NJ', hook: 'the boutiques along Nassau Street near the university' },
  { slug: 'asbury-park', city: 'Asbury Park', state: 'New Jersey', stateSlug: 'new-jersey', st: 'NJ', hook: 'the shops and makers along Cookman Avenue near the boardwalk' },
  // New Mexico
  { slug: 'albuquerque', city: 'Albuquerque', state: 'New Mexico', stateSlug: 'new-mexico', st: 'NM', hook: 'the shops of Nob Hill and the historic storefronts of Old Town' },
  { slug: 'santa-fe', city: 'Santa Fe', state: 'New Mexico', stateSlug: 'new-mexico', st: 'NM', hook: 'the galleries of Canyon Road and the shops around the Plaza' },
  { slug: 'las-cruces', city: 'Las Cruces', state: 'New Mexico', stateSlug: 'new-mexico', st: 'NM', hook: 'the makers and the farmers market of the historic downtown' },
  // New York
  { slug: 'new-york', city: 'New York', state: 'New York', stateSlug: 'new-york', st: 'NY', hook: "Brooklyn's Williamsburg and the boutiques of the East Village" },
  { slug: 'buffalo', city: 'Buffalo', state: 'New York', stateSlug: 'new-york', st: 'NY', hook: 'the shops of the Elmwood Village' },
  { slug: 'rochester', city: 'Rochester', state: 'New York', stateSlug: 'new-york', st: 'NY', hook: 'the stalls of the Public Market and the shops of Park Avenue' },
  { slug: 'albany', city: 'Albany', state: 'New York', stateSlug: 'new-york', st: 'NY', hook: 'the storefronts of Lark Street' },
  { slug: 'syracuse', city: 'Syracuse', state: 'New York', stateSlug: 'new-york', st: 'NY', hook: 'the shops and restaurants of Armory Square' },
  // North Carolina
  { slug: 'charlotte', city: 'Charlotte', state: 'North Carolina', stateSlug: 'north-carolina', st: 'NC', hook: 'the makers of NoDa and the storefronts of Plaza Midwood' },
  { slug: 'raleigh', city: 'Raleigh', state: 'North Carolina', stateSlug: 'north-carolina', st: 'NC', hook: 'the warehouse district and the shops of Glenwood South' },
  { slug: 'durham', city: 'Durham', state: 'North Carolina', stateSlug: 'north-carolina', st: 'NC', hook: 'the American Tobacco district and the shops of Ninth Street' },
  { slug: 'asheville', city: 'Asheville', state: 'North Carolina', stateSlug: 'north-carolina', st: 'NC', hook: 'the makers of downtown and the River Arts District' },
  { slug: 'greensboro', city: 'Greensboro', state: 'North Carolina', stateSlug: 'north-carolina', st: 'NC', hook: 'the storefronts of the downtown district' },
  // North Dakota
  { slug: 'fargo', city: 'Fargo', state: 'North Dakota', stateSlug: 'north-dakota', st: 'ND', hook: 'the shops and makers along Broadway downtown' },
  { slug: 'bismarck', city: 'Bismarck', state: 'North Dakota', stateSlug: 'north-dakota', st: 'ND', hook: 'the locally owned storefronts of the historic downtown' },
  // Ohio
  { slug: 'columbus', city: 'Columbus', state: 'Ohio', stateSlug: 'ohio', st: 'OH', hook: 'the boutiques of the Short North and the storefronts of German Village' },
  { slug: 'cleveland', city: 'Cleveland', state: 'Ohio', stateSlug: 'ohio', st: 'OH', hook: 'the makers of Ohio City and the shops of Tremont' },
  { slug: 'cincinnati', city: 'Cincinnati', state: 'Ohio', stateSlug: 'ohio', st: 'OH', hook: 'the shops and Findlay Market of Over-the-Rhine' },
  { slug: 'dayton', city: 'Dayton', state: 'Ohio', stateSlug: 'ohio', st: 'OH', hook: 'the storefronts of the Oregon District' },
  // Oklahoma
  { slug: 'oklahoma-city', city: 'Oklahoma City', state: 'Oklahoma', stateSlug: 'oklahoma', st: 'OK', hook: 'the shops of the Plaza District and Automobile Alley' },
  { slug: 'tulsa', city: 'Tulsa', state: 'Oklahoma', stateSlug: 'oklahoma', st: 'OK', hook: 'the storefronts of the Blue Dome district and Brookside' },
  // Oregon
  { slug: 'portland', city: 'Portland', state: 'Oregon', stateSlug: 'oregon', st: 'OR', hook: 'the shops of the Pearl District and the storefronts of Hawthorne' },
  { slug: 'eugene', city: 'Eugene', state: 'Oregon', stateSlug: 'oregon', st: 'OR', hook: 'the downtown shops and the Saturday Market' },
  { slug: 'bend', city: 'Bend', state: 'Oregon', stateSlug: 'oregon', st: 'OR', hook: 'the storefronts of downtown and the Old Mill District' },
  // Pennsylvania
  { slug: 'philadelphia', city: 'Philadelphia', state: 'Pennsylvania', stateSlug: 'pennsylvania', st: 'PA', hook: 'the makers of Fishtown and the shops along South Street' },
  { slug: 'pittsburgh', city: 'Pittsburgh', state: 'Pennsylvania', stateSlug: 'pennsylvania', st: 'PA', hook: 'the markets of the Strip District and the shops of Lawrenceville' },
  { slug: 'lancaster', city: 'Lancaster', state: 'Pennsylvania', stateSlug: 'pennsylvania', st: 'PA', hook: 'the stalls of Central Market and the shops of the downtown arts district' },
  { slug: 'harrisburg', city: 'Harrisburg', state: 'Pennsylvania', stateSlug: 'pennsylvania', st: 'PA', hook: 'the storefronts of the downtown riverfront district' },
  // Rhode Island
  { slug: 'providence', city: 'Providence', state: 'Rhode Island', stateSlug: 'rhode-island', st: 'RI', hook: 'the boutiques of Wayland Square and the shops of Thayer Street' },
  { slug: 'newport', city: 'Newport', state: 'Rhode Island', stateSlug: 'rhode-island', st: 'RI', hook: 'the shops along Thames Street near the harbor' },
  // South Carolina
  { slug: 'charleston', city: 'Charleston', state: 'South Carolina', stateSlug: 'south-carolina', st: 'SC', hook: 'the boutiques and makers along King Street' },
  { slug: 'columbia', city: 'Columbia', state: 'South Carolina', stateSlug: 'south-carolina', st: 'SC', hook: 'the shops of the Vista and Main Street downtown' },
  { slug: 'greenville', city: 'Greenville', state: 'South Carolina', stateSlug: 'south-carolina', st: 'SC', hook: 'the storefronts of the revitalized downtown Main Street' },
  // South Dakota
  { slug: 'sioux-falls', city: 'Sioux Falls', state: 'South Dakota', stateSlug: 'south-dakota', st: 'SD', hook: 'the shops along Phillips Avenue downtown' },
  { slug: 'rapid-city', city: 'Rapid City', state: 'South Dakota', stateSlug: 'south-dakota', st: 'SD', hook: 'the storefronts around Main Street Square' },
  // Tennessee
  { slug: 'memphis', city: 'Memphis', state: 'Tennessee', stateSlug: 'tennessee', st: 'TN', hook: 'the blues clubs of Beale Street and the independent shops and barbecue joints of Cooper-Young' },
  { slug: 'nashville', city: 'Nashville', state: 'Tennessee', stateSlug: 'tennessee', st: 'TN', hook: 'the honky-tonks of Broadway and the boutiques of East Nashville and the 12South strip' },
  { slug: 'knoxville', city: 'Knoxville', state: 'Tennessee', stateSlug: 'tennessee', st: 'TN', hook: 'the storefronts of Market Square downtown and the shops of the Old City' },
  { slug: 'chattanooga', city: 'Chattanooga', state: 'Tennessee', stateSlug: 'tennessee', st: 'TN', hook: 'the North Shore shops and the galleries of the Bluff View Art District' },
  // Texas
  { slug: 'houston', city: 'Houston', state: 'Texas', stateSlug: 'texas', st: 'TX', hook: 'the shops of the Heights and the galleries and kitchens of Montrose' },
  { slug: 'austin', city: 'Austin', state: 'Texas', stateSlug: 'texas', st: 'TX', hook: 'the South Congress strip and the local makers that keep Austin weird' },
  { slug: 'dallas', city: 'Dallas', state: 'Texas', stateSlug: 'texas', st: 'TX', hook: 'the shops of Bishop Arts and the galleries and storefronts of Deep Ellum' },
  { slug: 'san-antonio', city: 'San Antonio', state: 'Texas', stateSlug: 'texas', st: 'TX', hook: 'the shops of the Pearl district and the storefronts of Southtown' },
  { slug: 'fort-worth', city: 'Fort Worth', state: 'Texas', stateSlug: 'texas', st: 'TX', hook: 'the shops of the Near Southside along Magnolia Avenue' },
  { slug: 'el-paso', city: 'El Paso', state: 'Texas', stateSlug: 'texas', st: 'TX', hook: 'the locally owned storefronts of the historic downtown' },
  // Utah
  { slug: 'salt-lake-city', city: 'Salt Lake City', state: 'Utah', stateSlug: 'utah', st: 'UT', hook: 'the shops of the 9th and 9th district and downtown' },
  { slug: 'provo', city: 'Provo', state: 'Utah', stateSlug: 'utah', st: 'UT', hook: 'the storefronts along Center Street downtown' },
  { slug: 'ogden', city: 'Ogden', state: 'Utah', stateSlug: 'utah', st: 'UT', hook: 'the shops of Historic 25th Street' },
  // Vermont
  { slug: 'burlington', city: 'Burlington', state: 'Vermont', stateSlug: 'vermont', st: 'VT', hook: 'the shops of the Church Street Marketplace' },
  { slug: 'montpelier', city: 'Montpelier', state: 'Vermont', stateSlug: 'vermont', st: 'VT', hook: 'the locally owned storefronts of the historic downtown' },
  // Virginia
  { slug: 'richmond', city: 'Richmond', state: 'Virginia', stateSlug: 'virginia', st: 'VA', hook: 'the shops of Carytown and the storefronts of the Fan' },
  { slug: 'virginia-beach', city: 'Virginia Beach', state: 'Virginia', stateSlug: 'virginia', st: 'VA', hook: 'the makers of the ViBe Creative District' },
  { slug: 'norfolk', city: 'Norfolk', state: 'Virginia', stateSlug: 'virginia', st: 'VA', hook: 'the storefronts of the historic Ghent district' },
  { slug: 'alexandria', city: 'Alexandria', state: 'Virginia', stateSlug: 'virginia', st: 'VA', hook: 'the boutiques along King Street in Old Town' },
  { slug: 'charlottesville', city: 'Charlottesville', state: 'Virginia', stateSlug: 'virginia', st: 'VA', hook: 'the shops of the Downtown Mall' },
  // Washington
  { slug: 'seattle', city: 'Seattle', state: 'Washington', stateSlug: 'washington', st: 'WA', hook: 'the shops of Capitol Hill and Ballard and the stalls of Pike Place Market' },
  { slug: 'spokane', city: 'Spokane', state: 'Washington', stateSlug: 'washington', st: 'WA', hook: 'the storefronts of downtown and the Garland District' },
  { slug: 'tacoma', city: 'Tacoma', state: 'Washington', stateSlug: 'washington', st: 'WA', hook: 'the shops of the Sixth Avenue district' },
  // West Virginia
  { slug: 'charleston', city: 'Charleston', state: 'West Virginia', stateSlug: 'west-virginia', st: 'WV', hook: 'the shops along Capitol Street downtown' },
  { slug: 'morgantown', city: 'Morgantown', state: 'West Virginia', stateSlug: 'west-virginia', st: 'WV', hook: 'the storefronts of High Street near the university' },
  // Wisconsin
  { slug: 'milwaukee', city: 'Milwaukee', state: 'Wisconsin', stateSlug: 'wisconsin', st: 'WI', hook: 'the shops of the Historic Third Ward and the storefronts of Bay View' },
  { slug: 'madison', city: 'Madison', state: 'Wisconsin', stateSlug: 'wisconsin', st: 'WI', hook: 'the shops along State Street and the Saturday market on the Capitol Square' },
  { slug: 'green-bay', city: 'Green Bay', state: 'Wisconsin', stateSlug: 'wisconsin', st: 'WI', hook: 'the storefronts of the historic Broadway district' },
  // Wyoming
  { slug: 'cheyenne', city: 'Cheyenne', state: 'Wyoming', stateSlug: 'wyoming', st: 'WY', hook: 'the shops of the historic downtown depot district' },
  { slug: 'jackson', city: 'Jackson', state: 'Wyoming', stateSlug: 'wyoming', st: 'WY', hook: 'the shops and galleries around the Town Square' },
  // Washington, D.C.
  { slug: 'washington', city: 'Washington', state: 'Washington, D.C.', stateSlug: 'washington-dc', st: 'DC', hook: 'the boutiques of Georgetown and the shops of U Street and Eastern Market' },
];

export const NATIONAL_STATES: NationalState[] = Object.values(
  NATIONAL_CITIES.reduce<Record<string, NationalState>>((acc, c) => {
    acc[c.stateSlug] = { name: c.state, slug: c.stateSlug, st: c.st };
    return acc;
  }, {})
).sort((a, b) => a.name.localeCompare(b.name));

export function citiesInState(stateSlug: string): NationalCity[] {
  return NATIONAL_CITIES.filter((c) => c.stateSlug === stateSlug);
}

// Up to 3 sibling cities in the same state for internal linking.
export function nearbyNationalCities(city: NationalCity): NationalCity[] {
  return NATIONAL_CITIES.filter((c) => c.stateSlug === city.stateSlug && c.slug !== city.slug).slice(0, 3);
}
