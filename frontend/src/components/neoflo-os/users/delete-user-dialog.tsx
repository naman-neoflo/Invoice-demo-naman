// components/users/delete-user-dialog.tsx
//
// Confirm dialog for deleting a user. Blocks deleting the active user
// or the last admin via inline disabled state + toast message.

"use client"

import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/neoflo-os/ui/alert-dialog"
import { useUserStore } from "@/lib/neoflo-os/users/user-store"
import type { User } from "@/lib/neoflo-os/users/types"

export function DeleteUserDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}) {
  if (!user) return null
  const u = user

  const activeUserId = useUserStore.getState().activeUserId
  const isActiveUser = u.id === activeUserId
  const adminsLeft = useUserStore
    .getState()
    .users.filter((x) => x.roleId === "admin" && x.id !== u.id).length
  const isLastAdmin = u.roleId === "admin" && adminsLeft === 0

  function confirm() {
    if (isActiveUser) {
      toast.error("Can't delete the active user — switch to another user first.")
      onOpenChange(false)
      return
    }
    if (isLastAdmin) {
      toast.error("Can't delete the only Admin — promote another user first.")
      onOpenChange(false)
      return
    }
    useUserStore.getState().deleteUser(u.id)
    toast.success(`Deleted ${u.name}.`)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {u.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the user immediately. They won't be in the dropdown
            and any references in audit logs will show their name as deleted.
            {isActiveUser ? (
              <span className="text-destructive mt-2 block font-medium">
                You can't delete the user you're currently signed in as.
              </span>
            ) : null}
            {isLastAdmin ? (
              <span className="text-destructive mt-2 block font-medium">
                You can't delete the only Admin — promote another user to Admin first.
              </span>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirm} disabled={isActiveUser || isLastAdmin}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
