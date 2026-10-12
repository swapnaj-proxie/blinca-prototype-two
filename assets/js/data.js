/* Blinca – static data.
   Everything the site shows comes from this file: restaurants, menus,
   add-ons, offers, hero slides, saved addresses and the demo seed state.
   To use your own photos, drop them into assets/img/ and replace the URLs
   in IMG below (e.g. IMG.pizza = 'assets/img/pizza.jpg'). Any image that
   fails to load falls back to the plate placeholder automatically. */
window.BLINCA_DATA = (function () {
  'use strict';

  var F = function (n) { return 'assets/img/food/' + n + '.jpg'; };
  var IMG = {
    pizza: F('pizza'), pizza2: F('pizza'), sushi: F('sushi'), sushi2: F('hero-sushi'),
    burger: F('hero-burger'), burger2: F('burgers'), burger3: F('burgers'), thai: F('thai'),
    vegan: F('vegan'), kebab: F('kebab'), falafel: F('kebab'), fika: F('fika'), healthy: F('healthy'),
    offer1: F('offer1'), offer2: F('offer2'), offer3: F('offer3')
  };

  /* ---------- Add-on groups ---------- */
  var SAUCE = {
    id: 'sauce',
    name: { en: 'Sauce', sv: 'Sås' },
    min: 1, max: 1,
    choices: [
      { id: 'bearnaise', name: { en: 'Bearnaise', sv: 'Bearnaise' }, price: 0 },
      { id: 'garlic',    name: { en: 'Garlic sauce', sv: 'Vitlökssås' }, price: 0 },
      { id: 'chipotle',  name: { en: 'Chipotle mayo', sv: 'Chipotlemajonnäs' }, price: 0 }
    ]
  };

  var TOPPINGS = {
    id: 'toppings',
    name: { en: 'Extra toppings', sv: 'Extra toppings' },
    min: 0, max: 3,
    choices: [
      { id: 'cheese',    name: { en: 'Extra cheese', sv: 'Extra ost' }, price: 15 },
      { id: 'jalapenos', name: { en: 'Jalapeños', sv: 'Jalapeños' }, price: 10 },
      { id: 'mushrooms', name: { en: 'Mushrooms', sv: 'Champinjoner' }, price: 10 },
      { id: 'olives',    name: { en: 'Olives', sv: 'Oliver' }, price: 10 },
      { id: 'ham',       name: { en: 'Ham', sv: 'Skinka' }, price: 15 }
    ]
  };

  function days(open, close) {
    var a = [];
    for (var i = 0; i < 7; i++) a.push([open, close]);
    return a;
  }

  function item(id, en, sv, descEn, descSv, price, extra) {
    var o = { id: id, name: { en: en, sv: sv }, desc: { en: descEn, sv: descSv }, price: price, tags: [], options: [], image: null };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }

  /* ---------- Cuisines ---------- */
  var cuisines = [
    { id: 'pizza',   name: { en: 'Pizza',   sv: 'Pizza' },      image: IMG.pizza },
    { id: 'sushi',   name: { en: 'Sushi',   sv: 'Sushi' },      image: IMG.sushi },
    { id: 'burgers', name: { en: 'Burgers', sv: 'Hamburgare' }, image: IMG.burger3 },
    { id: 'thai',    name: { en: 'Thai',    sv: 'Thai' },       image: IMG.thai },
    { id: 'vegan',   name: { en: 'Vegan',   sv: 'Veganskt' },   image: IMG.vegan },
    { id: 'kebab',   name: { en: 'Kebab',   sv: 'Kebab' },      image: IMG.kebab },
    { id: 'fika',    name: { en: 'Fika',    sv: 'Fika' },       image: IMG.fika },
    { id: 'healthy', name: { en: 'Healthy', sv: 'Nyttigt' },    image: IMG.healthy }
  ];

  /* ---------- Restaurants ---------- */
  var restaurants = [
    {
      slug: 'blinca-demo', name: 'Blinca Demo', listed: false,
      cuisines: ['pizza', 'burgers'], priceLevel: 2, rating: 4.9, reviews: 12,
      fee: 39, eta: 30, pickupEta: 20, veg: true,
      status: 'open', closesAt: '00:00', opensAt: '10:00',
      address: 'Drottninggatan 10, 111 51 Stockholm',
      hours: days('10:00', '00:00'),
      image: IMG.burger, minOrder: 100, km: 1.2,
      popular: ['classic-burger', 'margherita', 'kebab-pizza'],
      menu: [
        { id: 'pizza', name: { en: 'Pizza', sv: 'Pizza' }, items: [
          item('margherita', 'Margherita', 'Margherita',
            'Tomato sauce, mozzarella, basil', 'Tomatsås, mozzarella, basilika', 119,
            { tags: ['vegetarian'], options: [TOPPINGS], image: IMG.pizza }),
          item('kebab-pizza', 'Kebab pizza', 'Kebabpizza',
            'Kebab meat, onion, pepperoncini, kebab sauce', 'Kebabkött, lök, peperoni, kebabsås', 139,
            { tags: ['spicy'], options: [SAUCE], image: IMG.pizza })
        ] },
        { id: 'burgers', name: { en: 'Burgers', sv: 'Burgare' }, items: [
          item('classic-burger', 'Classic burger', 'Klassisk burgare',
            '150 g beef, cheddar, lettuce, tomato', '150 g nötkött, cheddar, sallad, tomat', 149,
            { options: [SAUCE], image: IMG.burger2 }),
          item('halloumi-burger', 'Halloumi burger', 'Halloumiburgare',
            'Grilled halloumi, rocket, tomato, pickled red onion', 'Grillad halloumi, ruccola, tomat, picklad rödlök', 139,
            { tags: ['vegetarian'], options: [SAUCE], image: IMG.healthy })
        ] },
        { id: 'lunch', name: { en: "Today's lunch", sv: 'Dagens lunch' }, items: [
          item('pasta-carbonara', 'Pasta carbonara', 'Pasta carbonara',
            'Spaghetti, pancetta, egg yolk, parmesan', 'Spaghetti, pancetta, äggula, parmesan', 115),
          item('meatballs', 'Swedish meatballs', 'Köttbullar',
            'Mashed potatoes, lingonberries, cream sauce', 'Potatismos, lingon, gräddsås', 125)
        ] },
        { id: 'drinks', name: { en: 'Drinks', sv: 'Dryck' }, items: [
          item('sparkling-water', 'Sparkling water', 'Bubbelvatten', '33 cl', '33 cl', 22),
          item('cola', 'Coca-Cola', 'Coca-Cola', '33 cl', '33 cl', 25)
        ] }
      ]
    },
    {
      slug: 'sushi-sakura', name: 'Sushi Sakura', listed: true,
      cuisines: ['sushi'], priceLevel: 3, rating: 4.8, reviews: 1204,
      fee: 0, eta: 35, pickupEta: 20, veg: false,
      status: 'closed', opensAt: '16:00', closesAt: '22:00',
      address: 'Götgatan 12, 118 46 Stockholm',
      hours: days('16:00', '22:00'), image: IMG.sushi, minOrder: 150, km: 2.4,
      menu: [
        { id: 'sushi', name: { en: 'Sushi', sv: 'Sushi' }, items: [
          item('sushi-12', 'Sushi mix, 12 pieces', 'Sushimix, 12 bitar', 'Nigiri and maki, chef’s choice', 'Nigiri och maki, kockens val', 179),
          item('salmon-nigiri', 'Salmon nigiri, 8 pieces', 'Laxnigiri, 8 bitar', 'Salmon, sushi rice, wasabi', 'Lax, sushiris, wasabi', 139),
          item('california-roll', 'California roll', 'California roll', 'Crab, avocado, cucumber, sesame', 'Krabba, avokado, gurka, sesam', 119)
        ] }
      ]
    },
    {
      slug: 'grona-greken', name: 'Gröna Greken', listed: true,
      cuisines: ['vegan', 'healthy'], priceLevel: 2, rating: 4.7, reviews: 221,
      fee: 0, eta: 25, pickupEta: 15, veg: true,
      status: 'closed', opensAt: '11:00', closesAt: '20:00',
      address: 'Hornsgatan 40, 118 21 Stockholm',
      hours: days('11:00', '20:00'), image: IMG.vegan, minOrder: 100, km: 1.8,
      menu: [
        { id: 'bowls', name: { en: 'Bowls', sv: 'Bowls' }, items: [
          item('buddha-bowl', 'Buddha bowl', 'Buddha bowl', 'Quinoa, chickpeas, avocado, tahini', 'Quinoa, kikärtor, avokado, tahini', 135, { tags: ['vegetarian'] }),
          item('falafel-bowl', 'Falafel bowl', 'Falafelbowl', 'Falafel, hummus, pickles, greens', 'Falafel, hummus, pickles, grönt', 129, { tags: ['vegetarian'] })
        ] }
      ]
    },
    {
      slug: 'pizzeria-vesuvio', name: 'Pizzeria Vesuvio', listed: true,
      cuisines: ['pizza'], priceLevel: 2, rating: 4.6, reviews: 842,
      fee: 29, eta: 30, pickupEta: 15, veg: true,
      status: 'closed', opensAt: '15:00', closesAt: '23:00',
      address: 'Sankt Eriksgatan 22, 112 39 Stockholm',
      hours: days('15:00', '23:00'), image: IMG.pizza2, minOrder: 120, km: 3.1,
      menu: [
        { id: 'pizza', name: { en: 'Pizza', sv: 'Pizza' }, items: [
          item('vesuvio', 'Vesuvio', 'Vesuvio', 'Tomato sauce, cheese, ham', 'Tomatsås, ost, skinka', 109),
          item('capricciosa', 'Capricciosa', 'Capricciosa', 'Tomato sauce, cheese, ham, mushrooms', 'Tomatsås, ost, skinka, champinjoner', 119),
          item('quattro', 'Quattro formaggi', 'Quattro formaggi', 'Four cheeses', 'Fyra ostar', 125, { tags: ['vegetarian'] })
        ] }
      ]
    },
    {
      slug: 'bangkok-street', name: 'Bangkok Street', listed: true,
      cuisines: ['thai'], priceLevel: 2, rating: 4.5, reviews: 389,
      fee: 25, eta: 30, pickupEta: 15, veg: true,
      status: 'paused', opensAt: '11:00', closesAt: '21:00',
      address: 'Sveavägen 55, 113 59 Stockholm',
      hours: days('11:00', '21:00'), image: IMG.thai, minOrder: 120, km: 2.0,
      menu: [
        { id: 'wok', name: { en: 'Wok', sv: 'Wok' }, items: [
          item('pad-thai', 'Pad thai', 'Pad thai', 'Rice noodles, egg, tofu, peanuts', 'Risnudlar, ägg, tofu, jordnötter', 135),
          item('green-curry', 'Green curry', 'Grön curry', 'Coconut milk, chicken, Thai basil', 'Kokosmjölk, kyckling, thaibasilika', 139, { tags: ['spicy'] })
        ] }
      ]
    },
    {
      slug: 'burger-bror', name: 'Burger Bror', listed: true,
      cuisines: ['burgers'], priceLevel: 2, rating: 4.4, reviews: 657,
      fee: 19, eta: 25, pickupEta: 15, veg: true,
      status: 'closed', opensAt: '11:00', closesAt: '22:00',
      address: 'Odengatan 70, 113 22 Stockholm',
      hours: days('11:00', '22:00'), image: IMG.burger2, minOrder: 100, km: 2.7,
      menu: [
        { id: 'burgers', name: { en: 'Burgers', sv: 'Burgare' }, items: [
          item('bror-burger', 'Bror burger', 'Brorburgare', 'Double beef, cheddar, house sauce', 'Dubbelt nötkött, cheddar, husets sås', 155),
          item('chili-cheese', 'Chili cheese', 'Chili cheese', 'Beef, jalapeños, pepper jack', 'Nötkött, jalapeños, pepper jack', 149, { tags: ['spicy'] })
        ] }
      ]
    },
    {
      slug: 'cafe-kanel', name: 'Café Kanel', listed: true,
      cuisines: ['fika'], priceLevel: 1, rating: 4.7, reviews: 418,
      fee: 25, eta: 25, pickupEta: 10, veg: true,
      status: 'open', opensAt: '07:00', closesAt: '18:00',
      address: 'Hornsgatan 12, 118 20 Stockholm',
      hours: days('07:00', '18:00'), image: IMG.fika, minOrder: 60, km: 0.8,
      popular: ['fika-for-two', 'kanelbulle'],
      menu: [
        { id: 'buns', name: { en: 'Buns & pastries', sv: 'Bullar & bakverk' }, items: [
          item('kanelbulle', 'Cinnamon bun', 'Kanelbulle', 'Baked this morning', 'Bakad i morse', 35, { tags: ['vegetarian'], image: IMG.fika }),
          item('kardemumma', 'Cardamom bun', 'Kardemummabulle', 'Knotted, pearl sugar', 'Knuten, pärlsocker', 38, { tags: ['vegetarian'] }),
          item('fika-for-two', 'Fika for two', 'Fika för två', 'Two coffees and two buns', 'Två kaffe och två bullar', 79, { tags: ['vegetarian'], image: IMG.fika })
        ] },
        { id: 'coffee', name: { en: 'Coffee', sv: 'Kaffe' }, items: [
          item('cappuccino', 'Cappuccino', 'Cappuccino', 'Oat or regular milk', 'Havre- eller vanlig mjölk', 39),
          item('bryggkaffe', 'Filter coffee', 'Bryggkaffe', 'Free refill', 'Påtår ingår', 29)
        ] }
      ]
    },
    {
      slug: 'kebab-huset', name: 'Kebab Huset', listed: true,
      cuisines: ['kebab'], priceLevel: 1, rating: 4.2, reviews: 1533,
      fee: 15, eta: 20, pickupEta: 10, veg: false,
      status: 'closed', opensAt: '15:00', closesAt: '03:00',
      address: 'Ringvägen 100, 118 60 Stockholm',
      hours: days('15:00', '03:00'), image: IMG.kebab, minOrder: 80, km: 3.6,
      menu: [
        { id: 'kebab', name: { en: 'Kebab', sv: 'Kebab' }, items: [
          item('kebab-plate', 'Kebab plate', 'Kebabtallrik', 'Kebab meat, fries, salad, sauce', 'Kebabkött, pommes, sallad, sås', 119),
          item('kebab-wrap', 'Kebab wrap', 'Kebabrulle', 'Kebab meat, salad, sauce in bread', 'Kebabkött, sallad, sås i bröd', 99)
        ] }
      ]
    }
  ];

  /* ---------- Saved addresses ---------- */
  var addresses = [
    { id: 'home', label: 'Hem',  street: 'Swedenborgsgatan 1', zip: '118 48', city: 'Stockholm', deliverable: true,  extraEta: 10 },
    { id: 'work', label: 'Jobb', street: 'Lindholmspiren 5',   zip: '417 56', city: 'Göteborg',  deliverable: false, extraEta: 0 }
  ];

  /* ---------- Home page content ---------- */
  var heroSlides = [
    { theme: 'red', image: IMG.burger,
      title: { en: 'Free delivery on your first order', sv: 'Fri leverans på din första beställning' },
      text:  { en: 'Hungry? On it. Sign up and your first delivery from any kitchen is on us.',
               sv: 'Hungrig? Vi fixar det. Skapa ett konto så bjuder vi på din första leverans, från vilket kök som helst.' } },
    { theme: 'dark', image: IMG.sushi2,
      title: { en: '20% off at Kumo Sushi until 3 pm', sv: '20 % rabatt på Kumo Sushi till kl. 15' },
      text:  { en: 'Salmon rolls, nigiri and poke bowls – order before 3 pm.',
               sv: 'Laxrullar, nigiri och pokebowls – beställ före kl. 15.' } },
    { theme: 'pink', image: IMG.fika,
      title: { en: 'Fika for two, every afternoon', sv: 'Fika för två, varje eftermiddag' },
      text:  { en: 'Two coffees and two cinnamon buns for 79 kr between 2 and 5 pm.',
               sv: 'Två kaffe och två kanelbullar för 79 kr mellan kl. 14 och 17.' } }
  ];

  var offers = [
    { code: 'HELG', theme: 'red', image: IMG.offer1, rule: { type: 'freeDelivery', min: 199 },
      title: { en: 'Free delivery this weekend', sv: 'Fri leverans i helgen' },
      text:  { en: 'On every order over 199 kr', sv: 'På alla beställningar över 199 kr' } },
    { code: 'FORSTA20', theme: 'dark', image: IMG.offer2, rule: { type: 'percent', value: 20 },
      title: { en: '20% off your first order', sv: '20 % rabatt på första beställningen' },
      text:  { en: 'For new customers', sv: 'För nya kunder' } },
    { code: 'STUDENT15', theme: 'pink', image: IMG.offer3, rule: { type: 'percent', value: 15, weekday: 2 },
      title: { en: '15% student discount', sv: '15 % studentrabatt' },
      text:  { en: 'Every Tuesday with a valid student card', sv: 'Varje tisdag med giltigt studentkort' } },
    { code: 'LUNCH10', theme: 'pink', image: IMG.healthy, rule: { type: 'percent', value: 10, untilHour: 15 },
      title: { en: '10% off lunch', sv: '10 % rabatt på lunch' },
      text:  { en: 'Every day until 15:00', sv: 'Varje dag fram till kl. 15' } }
  ];

  /* home v2: trending dishes (share of orders this hour) and moods */
  var trending = [
    ['blinca-demo', 'classic-burger', 32], ['blinca-demo', 'margherita', 18], ['blinca-demo', 'kebab-pizza', 11],
    ['blinca-demo', 'halloumi-burger', 9], ['blinca-demo', 'pasta-carbonara', 6]
  ];
  var moods = [
    { id: 'comfort', icon: 'flame', image: IMG.burger2, cuisines: ['burgers', 'pizza', 'kebab'],
      name: { en: 'Comfort food', sv: 'Husmanskänsla' }, text: { en: 'Burgers, pizza, kebab', sv: 'Burgare, pizza, kebab' } },
    { id: 'light', icon: 'leaf', image: IMG.healthy, cuisines: ['vegan', 'healthy'],
      name: { en: 'Light & fresh', sv: 'Lätt & fräscht' }, text: { en: 'Bowls, salads, vegan', sv: 'Bowls, sallader, veganskt' } },
    { id: 'treat', icon: 'star', image: IMG.sushi, cuisines: ['sushi', 'thai'],
      name: { en: 'Treat yourself', sv: 'Unna dig' }, text: { en: 'Sushi, Thai & chef’s picks', sv: 'Sushi, thai & kockens val' } },
    { id: 'fika', icon: 'heart', image: IMG.fika, cuisines: ['fika'],
      name: { en: 'Fika break', sv: 'Fikapaus' }, text: { en: 'Coffee, buns & sweets', sv: 'Kaffe, bullar & sött' } }
  ];

  var popular = [
    ['blinca-demo', 'margherita'],
    ['blinca-demo', 'kebab-pizza'],
    ['blinca-demo', 'classic-burger'],
    ['blinca-demo', 'halloumi-burger'],
    ['blinca-demo', 'pasta-carbonara'],
    ['blinca-demo', 'meatballs'],
    ['blinca-demo', 'sparkling-water']
  ];

  /* ---------- Demo state loaded on first visit ---------- */
  var seed = {
    address: 'home',
    favorites: ['sushi-sakura'],
    cart: [
      { slug: 'blinca-demo', itemId: 'classic-burger', opts: { sauce: ['bearnaise'] }, qty: 2 },
      { slug: 'blinca-demo', itemId: 'classic-burger', opts: { sauce: ['garlic'] },    qty: 1 },
      { slug: 'blinca-demo', itemId: 'kebab-pizza',    opts: { sauce: ['bearnaise'] }, qty: 1 }
    ],
    orders: [
      { id: 'BL-10424', slug: 'blinca-demo', date: '2026-10-09T18:12:00', amount: 357, mode: 'delivery',
        items: [{ itemId: 'margherita', opts: {}, qty: 3 }] },
      { id: 'BL-10398', slug: 'blinca-demo', date: '2026-10-08T19:40:00', amount: 238, mode: 'delivery',
        items: [{ itemId: 'margherita', opts: {}, qty: 2 }] },
      { id: 'BL-10391', slug: 'blinca-demo', date: '2026-10-08T13:05:00', amount: 44, mode: 'pickup',
        items: [{ itemId: 'sparkling-water', opts: {}, qty: 2 }] },
      { id: 'BL-10388', slug: 'blinca-demo', date: '2026-10-08T12:20:00', amount: 22, mode: 'pickup',
        items: [{ itemId: 'sparkling-water', opts: {}, qty: 1 }] }
    ]
  };

  return {
    images: IMG,
    cuisines: cuisines,
    restaurants: restaurants,
    addresses: addresses,
    heroSlides: heroSlides,
    offers: offers,
    popular: popular,
    trending: trending,
    moods: moods,
    seed: seed,
    vatRate: 0.12
  };
})();
