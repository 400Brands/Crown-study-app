import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  useDisclosure,
  Avatar,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { useNavigate, useLocation } from "react-router-dom";

// Define the allowed size types
type ButtonSize = "sm" | "md" | "lg";

// Define component props interface
interface GetStartedProps {
  size: ButtonSize;
}

export default function GetStarted({ size }: GetStartedProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation(); // Add location hook to check current route

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

  const navigateToDashboard = () => {
    navigate("/dashboard");
  };

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

  // Check if current route is /dashboard
  const isDashboardRoute = location.pathname === "/";

  // If on dashboard route and user is logged in, show avatar
  if (!isDashboardRoute && session) {
    return (
      <Avatar
        isBordered
        color="success"
        src={session.user?.user_metadata?.avatar_url}
        name={session.user?.user_metadata?.full_name || session.user?.email}
        size={size}
        showFallback
      />
    );
  }

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
            onPress={() => navigateToDashboard()}
            className="bg-primary text-default-100"
          >
            Dashboard
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
