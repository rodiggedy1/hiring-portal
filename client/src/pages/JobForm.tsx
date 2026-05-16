import { useEffect } from "react";
import { useLocation } from "wouter";

export default function JobForm() {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation("/hiring"); }, [setLocation]);
  return null;
}
