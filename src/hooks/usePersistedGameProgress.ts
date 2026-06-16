import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Content } from '@/data/Content'

type ScenarioReactions = { [key: string]: string }

type PersistedProgress = {
  foundSituations: string[]
  scenarioReactions: ScenarioReactions
}

type UsePersistedGameProgressArgs = {
  content: Content
  foundSituations: string[]
  setFoundSituations: Dispatch<SetStateAction<string[]>>
  scenarioReactions: ScenarioReactions
  setScenarioReactions: Dispatch<SetStateAction<ScenarioReactions>>
}

const usePersistedGameProgress = ({
  content,
  foundSituations,
  setFoundSituations,
  scenarioReactions,
  setScenarioReactions
}: UsePersistedGameProgressArgs) => {
  const [hydratedProgressKey, setHydratedProgressKey] = useState<string>()
  const progressCookieName = useMemo(() => getProgressCookieName(content.mapJson), [content.mapJson])

  useEffect(() => {
    if (!progressCookieName) return

    const persistedProgress = readProgressCookie(progressCookieName)
    const sanitizedProgress = sanitizePersistedProgress(content, persistedProgress)

    setFoundSituations(sanitizedProgress.foundSituations)
    setScenarioReactions(sanitizedProgress.scenarioReactions)
    setHydratedProgressKey(progressCookieName)
  }, [content, progressCookieName, setFoundSituations, setScenarioReactions])

  useEffect(() => {
    if (!progressCookieName || hydratedProgressKey !== progressCookieName) return

    writeProgressCookie(progressCookieName, {
      foundSituations,
      scenarioReactions
    })
  }, [foundSituations, hydratedProgressKey, progressCookieName, scenarioReactions])
}

export default usePersistedGameProgress

const getProgressCookieName = (mapJson?: string) => {
  if (!mapJson) return undefined

  return `vca_progress_${mapJson.replace(/[^a-z0-9]/gi, '_')}`
}

const readProgressCookie = (cookieName: string): PersistedProgress => {
  if (typeof document === 'undefined') {
    return emptyPersistedProgress()
  }

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${cookieName}=`))

  if (!cookie) {
    return emptyPersistedProgress()
  }

  try {
    const cookieValue = cookie.slice(cookieName.length + 1)
    const parsedValue = JSON.parse(decodeURIComponent(cookieValue)) as Partial<PersistedProgress>

    return {
      foundSituations: Array.isArray(parsedValue.foundSituations)
        ? parsedValue.foundSituations.filter((value): value is string => typeof value === 'string')
        : [],
      scenarioReactions: isStringRecord(parsedValue.scenarioReactions)
        ? parsedValue.scenarioReactions
        : {}
    }
  } catch {
    return emptyPersistedProgress()
  }
}

const writeProgressCookie = (cookieName: string, progress: PersistedProgress) => {
  if (typeof document === 'undefined') return

  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(progress))}; expires=${expiresAt.toUTCString()}; path=/; SameSite=Lax`
}

const sanitizePersistedProgress = (content: Content, progress: PersistedProgress): PersistedProgress => {
  const allowedSituations = new Set(content.finder?.situations ?? [])
  const foundSituations = progress.foundSituations.filter((situation) => allowedSituations.has(situation))
  const scenarioReactions = Object.entries(progress.scenarioReactions).reduce<ScenarioReactions>((acc, [scenarioId, reactionId]) => {
    const scenario = content.scenarios[scenarioId]
    if (!scenario) {
      return acc
    }

    const reactionExists = scenario.reactions.some((reaction) => reaction.id === reactionId)
    if (reactionExists) {
      acc[scenarioId] = reactionId
    }

    return acc
  }, {})

  return {
    foundSituations,
    scenarioReactions
  }
}

const emptyPersistedProgress = (): PersistedProgress => ({
  foundSituations: [],
  scenarioReactions: {}
})

const isStringRecord = (value: unknown): value is ScenarioReactions => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }

  return Object.values(value).every((entry) => typeof entry === 'string')
}