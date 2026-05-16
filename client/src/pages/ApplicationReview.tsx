import { useEffect } from "react";
import { useLocation } from "wouter";

export default function ApplicationReview() {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation("/hiring"); }, [setLocation]);
  return null;
}
