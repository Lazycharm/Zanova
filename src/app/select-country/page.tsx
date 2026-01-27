import { CountrySelection } from './country-selection-client'

export const metadata = {
  title: 'Select Your Country | ZANOVA',
  description: 'ZANOVA is available in multiple countries. Select your location to continue.',
}

export default function SelectCountryPage() {
  return <CountrySelection />
}
