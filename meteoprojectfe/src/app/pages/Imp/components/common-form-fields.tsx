import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CommonFormFieldsProps {
  idPrefix: string
}

export function CommonFormFields({ idPrefix }: CommonFormFieldsProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-nom`}>Nom</Label>
        <Input id={`${idPrefix}-nom`} placeholder="Nom" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Textarea id={`${idPrefix}-description`} placeholder="Description" />
      </div>
    </>
  )
}
