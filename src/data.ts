import azurImg from './assets/scooters/azur.jpg'
import cappuccinoImg from './assets/scooters/cappuccino-s.jpg'
import dreamImg from './assets/scooters/dream.png'
import sniperImg from './assets/scooters/sniper.jpg'
import trevisImg from './assets/scooters/trevis.jpg'
import optimusImg from './assets/scooters/optimus.png'
import symStImg from './assets/scooters/sym-st.png'
import symJetXImg from './assets/scooters/sym-jet-x.jpg'
import symJet4RxImg from './assets/scooters/sym-jet-4-rx.png'
import symOrbit2Img from './assets/scooters/sym-orbit-2.jpg'
import fiddleImg from './assets/scooters/fiddle.png'
import digitaImg from './assets/scooters/digita-51.png'
import megatronImg from './assets/scooters/megatron.png'
import firefoxImg from './assets/scooters/firefox.jpg'
import laVitaImg from './assets/scooters/la-vita.jpg'
import floraImg from './assets/scooters/flora.png'
import dayunSonicImg from './assets/scooters/dayun-sonic.png'
import { catalogBase } from './catalog'

export type ScooterItem = {
  id: string
  name: string
  brand: string
  company: string
  category: string
  image?: string
  description: string
  specs: string[]
  engine?: string
  transmission?: string
  braking?: string
  tank?: string
  topSpeed?: string
  usage?: string
  price?: number
  confidence?: 'confirmed' | 'probable' | 'unclear'
}

export const scooterBrands = [
  {
    id: 'slc',
    name: 'SLC',
    company: 'SLC Moto',
    description: 'Scooters urbains, néo-rétro et modèles accessibles pour la ville.',
  },
  {
    id: 'dayun',
    name: 'Dayun',
    company: 'Dayun Motors',
    description: 'Ligne urbaine et sportive, modèles city et plus dynamiques.',
  },
  {
    id: 'bbm',
    name: 'BBM',
    company: 'Black Bulls Motors',
    description: 'Modèles 50cc et 125cc distribués en Tunisie, entre scooter urbain et look rétro.',
  },
  {
    id: 'sym',
    name: 'SYM',
    company: 'SYM',
    description: 'Marque reconnue avec des scooters urbains, GT et premium.',
  },
]

export const categories = [
  'Scooters urbains',
  'Scooters sport',
  'Scooters néo-rétro',
  'Scooters GT',
  'Scooters 50cc',
  'Pièces & accessoires',
  'Équipements motards',
]

const imageMap: Record<string, string> = {
  'cappuccino-s': cappuccinoImg,
  azur: azurImg,
  dream: dreamImg,
  sniper: sniperImg,
  trevis: trevisImg,
  optimus: optimusImg,
  'sym-st': symStImg,
  'sym-jet-x': symJetXImg,
  'sym-jet-4-rx': symJet4RxImg,
  'sym-orbit-2': symOrbit2Img,
  fiddle: fiddleImg,
  'digita-51': digitaImg,
  megatron: megatronImg,
  firefox: firefoxImg,
  'la-vita': laVitaImg,
  flora: floraImg,
  'dayun-sonic': dayunSonicImg,
}

const enrichedKnown: ScooterItem[] = [
  {
    id: 'cappuccino-s',
    name: 'Cappuccino S 125',
    brand: 'SLC',
    company: 'SLC Moto',
    category: 'Scooters néo-rétro',
    image: cappuccinoImg,
    description: 'Le best-seller urbain, élégant, confortable et parfait pour les trajets quotidiens.',
    specs: ['125 cc', '4 temps', 'CVT', 'Disque avant / tambour arrière'],
    engine: '125 cc, 4 temps',
    transmission: 'CVT',
    braking: 'Disque avant, tambour arrière',
    tank: '4.5 à 6 L',
    topSpeed: '≈ 90 km/h',
    usage: 'Ville, style et confort quotidien',
    confidence: 'confirmed',
  },
  {
    id: 'azur',
    name: 'Azur 125',
    brand: 'SLC',
    company: 'SLC Moto',
    category: 'Scooters urbains',
    image: azurImg,
    description: 'Un scooter urbain moderne avec un look propre, un tableau digital et un gabarit pratique.',
    specs: ['125 cc', '4 temps', 'Pneus 12 pouces', 'Tableau de bord digital'],
    engine: '125 cc, 4 temps',
    transmission: 'Automatique',
    braking: 'Freinage efficace',
    tank: 'Non précisé',
    topSpeed: 'Usage urbain',
    usage: 'Ville et trajets périurbains',
    price: 5399,
    confidence: 'confirmed',
  },
  {
    id: 'dream',
    name: 'Dayun Dream 23',
    brand: 'Dayun',
    company: 'Dayun Motors',
    category: 'Scooters urbains',
    image: dreamImg,
    description: 'Pensé pour la ville, avec une conduite souple, une bonne autonomie et un style accessible.',
    specs: ['124 cc', '4 temps', 'Réservoir 4.5 L', 'Vitesse max 100 km/h'],
    engine: '124 cc, 4 temps',
    transmission: '4 vitesses (fiche vendeur)',
    braking: 'Disque avant, tambour arrière',
    tank: '4.5 L',
    topSpeed: '100 km/h',
    usage: 'Ville, petits trajets et usage quotidien',
    confidence: 'confirmed',
  },
  {
    id: 'sniper',
    name: 'Dayun Sniper',
    brand: 'Dayun',
    company: 'Dayun Motors',
    category: 'Scooters sport',
    image: sniperImg,
    description: 'Ligne plus nerveuse, présence moderne, freins plus affirmés et look plus agressif.',
    specs: ['124 cc', '4 temps', 'CVT', 'Double disque + keyless'],
    engine: '124 cc, monocylindre 4 temps',
    transmission: 'CVT',
    braking: 'Disque avant et arrière',
    tank: 'Non précisé',
    topSpeed: 'Profil dynamique urbain',
    usage: 'Ville, look sport, conduite plus nerveuse',
    price: 5199,
    confidence: 'confirmed',
  },
]

const knownIds = new Set(enrichedKnown.map((item) => item.id))

const catalogItems: ScooterItem[] = catalogBase
  .filter((item) => !knownIds.has(item.id))
  .map((item) => ({
    id: item.id,
    name: item.name,
    brand: item.brand,
    company: item.company,
    category: item.brand === 'SYM' ? 'Scooters urbains' : item.id.includes('49') || item.id.includes('digita') || item.id === 'firefox' ? 'Scooters 50cc' : item.id === 'trevis' || item.id === 'optimus' || item.id === 'megatron' ? 'Scooters sport' : 'Scooters urbains',
    image: imageMap[item.id],
    description:
      item.id === 'la-vita'
        ? 'Scooter 125 injection, style néo-rétro, jantes 12 pouces, top case et éclairage LED.'
        : item.id === 'flora'
          ? 'Dayun Flora 125cc, monocylindre 4 temps, double disque, style compact moderne.'
          : item.id === 'trevis'
            ? 'BBM Trevis 125cc, scooter puissant et économique, freins à disque avant/arrière.'
            : item.id === 'optimus'
              ? 'BBM Optimus 125cc, style sportif, tableau digital, éclairage LED et moteur Zongshen.'
              : item.id === 'dayun-sonic'
                ? 'Dayun Sonic, scooter urbain compact et économique, pensé pour les petits trajets.'
                : item.id === 'sym-st'
                  ? 'Grand scooter SYM orienté confort et stabilité, avec ABS et moteur EFI.'
                  : item.id === 'sym-jet-x'
                    ? 'SYM Jet X, scooter 125 sportif et moderne, refroidissement liquide et injection.'
                    : item.id === 'sym-jet-4-rx'
                      ? 'SYM Jet 4 RX, scooter urbain 125 à variateur, simple et efficace.'
                      : item.id === 'sym-orbit-2'
                        ? 'SYM Orbit 2, scooter 125 économique et fiable pour la ville.'
                        : item.id === 'fiddle'
                          ? 'SYM Fiddle 125, scooter au style néo-rétro avec moteur 4 temps et CVT.'
                          : item.id === 'megatron'
                            ? 'BBM Megatron 125, moto/scooter léger avec double disque et suspension hydraulique.'
                            : item.id === 'firefox'
                              ? 'Firefox 49, scooter 50cc urbain, CVT, économique et compact.'
                              : item.id === 'digita-51'
                                ? 'Digita 51, scooter 49.9cc 2 temps, compact et léger pour la ville.'
                                : `Modèle ${item.name} ajouté au catalogue MotoCity. Fiche détaillée à enrichir.`,
    specs:
      item.id === 'la-vita'
        ? ['125 cc injection', 'Freins CBS', 'Jantes 12 pouces', 'Clé intelligente']
        : item.id === 'flora'
          ? ['125 cc', '4 temps', 'Disque avant/arrière', 'Réservoir 13 L']
          : item.id === 'trevis'
            ? ['125 cc', '6.6 kW', 'Double disque', 'Réservoir 6.8 L']
            : item.id === 'optimus'
              ? ['125 cc', 'Moteur Zongshen', 'LED', 'Tableau digital']
              : item.id === 'dayun-sonic'
                ? ['49 cc', '4 temps', 'Automatique', '45-50 km/h']
                : item.id === 'sym-st'
                  ? ['168.9 cc', 'EFI', 'ABS avant/arrière', 'Réservoir 7 L']
                  : item.id === 'sym-jet-x'
                    ? ['124.6 cc injection', 'Liquide', 'CVT', '9.3 kW']
                    : item.id === 'sym-jet-4-rx'
                      ? ['124.6 cc', 'CVT', '99 km/h', '6199 DT']
                      : item.id === 'sym-orbit-2'
                        ? ['124.6 cc injection', 'Disque/tambour', 'Réservoir 5.2 L', '105 kg']
                        : item.id === 'fiddle'
                          ? ['124.6 cc', '4 temps', 'CVT', '5850 DT']
                          : item.id === 'megatron'
                            ? ['125 cc', 'Air', 'Double disque', '3799 DT']
                            : item.id === 'firefox'
                              ? ['49 cc', '4 temps', 'CVT', '45 km/h']
                              : item.id === 'digita-51'
                                ? ['49.9 cc', '2 temps', 'Automatique', 'Réservoir 5.5 L']
                                : [item.price ? `${item.price} DT` : 'Prix à confirmer', `Confiance: ${item.confidence}`],
    engine:
      item.id === 'la-vita'
        ? '125 cc injection électronique'
        : item.id === 'flora'
          ? '125 cc monocylindre 4 temps'
          : item.id === 'trevis'
            ? '125 cc, 6.6 kW à 8000 tr/min'
            : item.id === 'optimus'
              ? '125 cc Zongshen'
              : item.id === 'dayun-sonic'
                ? '49 cc, 4 temps'
                : item.id === 'sym-st'
                  ? '168.9 cc, 4 temps, EFI'
                  : item.id === 'sym-jet-x'
                    ? '124.6 cc, 4 temps, injection'
                    : item.id === 'sym-jet-4-rx'
                      ? '124.6 cc, 4 temps'
                      : item.id === 'sym-orbit-2'
                        ? '124.6 cc, 4 temps, injection'
                        : item.id === 'fiddle'
                          ? '124.6 cc, monocylindre 4 temps'
                          : item.id === 'megatron'
                            ? '125 cc, refroidissement air'
                            : item.id === 'firefox'
                              ? '49 cc, 4 temps'
                              : item.id === 'digita-51'
                                ? '49.9 cc, 2 temps'
                                : undefined,
    transmission:
      item.id === 'flora'
        ? 'Chaîne, 5 rapports'
        : item.id === 'dayun-sonic'
          ? 'Automatique'
          : item.id === 'sym-st' || item.id === 'sym-jet-x' || item.id === 'sym-jet-4-rx' || item.id === 'fiddle'
            ? 'CVT'
            : item.id === 'sym-orbit-2'
              ? 'Variateur, courroie'
              : item.id === 'digita-51'
                ? 'Automatique'
                : undefined,
    braking:
      item.id === 'la-vita'
        ? 'CBS'
        : item.id === 'flora'
          ? 'Disque avant et arrière'
          : item.id === 'trevis'
            ? 'Disque avant et arrière'
            : item.id === 'optimus'
              ? 'Freins à disque'
              : item.id === 'sym-st'
                ? 'ABS avant et arrière'
                : item.id === 'sym-jet-4-rx'
                  ? 'Non précisé sur fiche courte'
                  : item.id === 'sym-orbit-2'
                    ? 'Disque avant, tambour arrière'
                    : item.id === 'firefox'
                      ? 'Disque avant, tambour arrière'
                      : item.id === 'digita-51'
                        ? 'Disque avant, tambour arrière'
                        : undefined,
    tank:
      item.id === 'flora'
        ? '13 L'
        : item.id === 'trevis'
          ? '6.8 L'
          : item.id === 'sym-st'
            ? '7 L'
            : item.id === 'sym-orbit-2'
              ? '5.2 L'
              : item.id === 'firefox'
                ? '6.3 L'
                : item.id === 'digita-51'
                  ? '5.5 L'
                  : undefined,
    topSpeed:
      item.id === 'flora'
        ? '90 à 120 km/h'
        : item.id === 'dayun-sonic'
          ? '45 à 50 km/h'
          : item.id === 'sym-jet-4-rx'
            ? '99 km/h'
            : item.id === 'firefox'
              ? '45 km/h'
              : undefined,
    usage:
      item.id === 'dayun-sonic'
        ? 'Ville, mobilité légère, économie maximale'
        : item.id === 'trevis'
          ? 'Ville et trajets plus soutenus'
          : item.id === 'la-vita'
            ? 'Ville, style et confort premium'
            : item.id === 'flora'
              ? 'Ville, usage quotidien et confort'
              : item.id === 'optimus'
                ? 'Ville et look sportif'
                : item.id === 'sym-st'
                  ? 'Confort GT, ville et route'
                  : item.id === 'sym-jet-x'
                    ? 'Ville, style sport, usage quotidien premium'
                    : item.id === 'sym-jet-4-rx'
                      ? 'Ville et trajets quotidiens'
                      : item.id === 'sym-orbit-2'
                        ? 'Ville, économie et simplicité'
                        : item.id === 'fiddle'
                          ? 'Ville, look rétro chic'
                          : item.id === 'megatron'
                            ? 'Ville, style agressif et mobilité légère'
                            : item.id === 'firefox'
                              ? 'Ville, mobilité 50cc'
                              : item.id === 'digita-51'
                                ? 'Ville, mobilité légère 50cc'
                                : undefined,
    price: item.price,
    confidence: item.confidence,
  }))

export const scooters: ScooterItem[] = [...enrichedKnown, ...catalogItems]
