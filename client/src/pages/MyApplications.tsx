import { useEffect } from "react";
import { useLocation } from "wouter";

export default function MyApplications() {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation("/apply"); }, [setLocation]);
  return null;
}
