import { useState, useEffect } from "react"

export function useBreakpointSide(): "bottom" | "right" {
  const [side, setSide] = useState<"bottom" | "right">("bottom")

  useEffect(() => {
    const updateSide = () => {
      if (window.innerWidth >= 768) {
        setSide("right")
      } else {
        setSide("bottom")
      }
    }

    updateSide()
    window.addEventListener("resize", updateSide)
    return () => window.removeEventListener("resize", updateSide)
  }, [])

  return side
}