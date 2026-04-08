export type CatalogItem = {
  id: string
  name: string
  brand: string
  company: string
  price?: number
  confidence: 'confirmed' | 'probable' | 'unclear'
}

export const catalogBase: CatalogItem[] = [
  { id: 'la-vita', name: 'La Vita 125', brand: 'La Vita', company: 'La Vita / distributeur local', price: 5999, confidence: 'probable' },
  { id: 'sniper', name: 'Dayun Sniper', brand: 'Dayun', company: 'Dayun Motors', price: 5199, confidence: 'confirmed' },
  { id: 'flora', name: 'Flora', brand: 'SLC', company: 'SLC Moto', price: 4999, confidence: 'unclear' },
  { id: 'azur', name: 'Azur 125', brand: 'SLC', company: 'SLC Moto', price: 5399, confidence: 'confirmed' },
  { id: 'trevis', name: 'Trevis 125', brand: 'BBM', company: 'Black Bulls Motors', price: 4799, confidence: 'confirmed' },
  { id: 'megatron', name: 'Megatron 125', brand: 'BBM', company: 'Black Bulls Motors', confidence: 'confirmed' },
  { id: 'optimus', name: 'Optimus 125', brand: 'BBM', company: 'Black Bulls Motors', confidence: 'confirmed' },
  { id: 'dayun-sonic', name: 'Dayun Sonic', brand: 'Dayun', company: 'Dayun Motors', price: 2999, confidence: 'confirmed' },
  { id: 'digita-51', name: 'Digita 51', brand: 'BBM', company: 'Black Bulls Motors', confidence: 'confirmed' },
  { id: 'sym-st', name: 'SYM ST', brand: 'SYM', company: 'SYM', confidence: 'probable' },
  { id: 'sym-symphony-injection', name: 'SYM Symphony Injection', brand: 'SYM', company: 'SYM', price: 7999, confidence: 'confirmed' },
  { id: 'sym-jet-x', name: 'SYM Jet X', brand: 'SYM', company: 'SYM', confidence: 'probable' },
  { id: 'sym-jet-4-rx', name: 'SYM Jet 4 RX', brand: 'SYM', company: 'SYM', confidence: 'probable' },
  { id: 'sym-orbit-2', name: 'SYM Orbit 2', brand: 'SYM', company: 'SYM', confidence: 'probable' },
  { id: 'fiddle', name: 'SYM Fiddle', brand: 'SYM', company: 'SYM', confidence: 'probable' },
  { id: 'firefox', name: 'Firefox 49', brand: 'BBM', company: 'Black Bulls Motors', confidence: 'confirmed' },
]
