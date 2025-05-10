import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  useDisclosure,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/supabaseClient";
import { Session } from "@supabase/supabase-js";

// Define the allowed size types
type ButtonSize = "sm" | "md" | "lg";

// Define component props interface
interface GetStartedProps {
  size: ButtonSize;
}

export default function GetStarted({ size }: GetStartedProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleOpen = () => {
    onOpen();
  };

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  console.log(session?.user?.email);

  const signOut = async () => {
    const {error} = await supabase.auth.signOut();
  }

  const renderAuthContent = () => {
    if (!session) {
      return (
        <Auth
          providers={["google"]}
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          redirectTo={`${window.location.origin}/dashboard`}
        />
      );
    } else {
      return <div>Logged in!</div>;
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {!session ? (
          <Button
            size={size}
            onPress={() => handleOpen()}
            className="bg-primary text-default-100"
          >
            Get Started
          </Button>
        ) : (
          <Button
            size={size}
            onPress={() => signOut()}
            className="bg-primary text-default-100"
          >
            Sign Out
          </Button>
        )}
      </div>
      <Modal isOpen={isOpen} size="lg" onClose={onClose}>
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">Sign In</ModalHeader>
            <ModalBody>{renderAuthContent()}</ModalBody>
          </>
        </ModalContent>
      </Modal>
    </>
  );
}
