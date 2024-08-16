import { createCampaign } from '@/app/dashboard/actions'

export default function CreateCampaignForm() {
  return (
    <form action={createCampaign}>
      <input name="name" type="text" placeholder="Campaign Name" required />
      <textarea name="description" placeholder="Campaign Description" required />
      <button type="submit">Create Campaign</button>
    </form>
  )
}