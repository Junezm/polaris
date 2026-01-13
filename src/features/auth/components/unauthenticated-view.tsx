import { ShieldAlertIcon } from "lucide-react";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
  ItemMedia,
  ItemActions,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";

export const UnauthenticatedView = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-lg bg-muted">
        <Item variant="outline">
          <ItemMedia>
            <ShieldAlertIcon className="w-12 h-12" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Unauthorized Access</ItemTitle>
            <ItemDescription>
              You must be signed in to view this page.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <SignInButton />
            </Button>
          </ItemActions>
        </Item>
      </div>
    </div>
  );
};
