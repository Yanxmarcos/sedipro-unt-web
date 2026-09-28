import { redirect } from 'next/navigation'

export default function VotacionRedirect() {
  redirect('/panel/votaciones/votar')
}
