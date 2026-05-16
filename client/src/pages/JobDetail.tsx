import { useEffect } from "react";
import { useLocation } from "wouter";

export default function JobDetail() {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation("/apply"); }, [setLocation]);
  return null;
}
