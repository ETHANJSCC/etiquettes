import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { SuggestComputerNameResult } from '@shared/types'
import { computeNextComputerName } from '@shared/computerName'

const execFileAsync = promisify(execFile)

/** Lettres et chiffres uniquement : ecarte tout caractere special du filtre LDAP. */
const PREFIX_PATTERN = /^[A-Z0-9]{1,10}$/

/**
 * Requete AD via ADSI, integre a Windows (aucune dependance externe, aucun
 * identifiant a gerer). Elle s'execute avec l'identite Windows de
 * l'utilisateur connecte (authentification integree), qui n'a besoin que
 * d'un droit de lecture sur les objets ordinateur - deja accorde par defaut
 * a tout compte du domaine.
 *
 * Le prefixe est transmis via une variable d'environnement (jamais
 * interpole dans le texte du script) et valide au prealable cote Node.
 */
const AD_QUERY_SCRIPT = `
$ErrorActionPreference = 'Stop'
$prefix = $env:ETIQTOOL_AD_PREFIX
$searcher = [adsisearcher]"(&(objectClass=computer)(name=$prefix*))"
$searcher.PropertiesToLoad.Add('name') | Out-Null
$searcher.PageSize = 1000
$results = $searcher.FindAll()
foreach ($r in $results) { $r.Properties['name'][0] }
`.trim()

async function queryComputerNames(prefix: string): Promise<string[]> {
  const { stdout } = await execFileAsync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', AD_QUERY_SCRIPT],
    {
      env: { ...process.env, ETIQTOOL_AD_PREFIX: prefix },
      timeout: 15000,
      windowsHide: true
    }
  )

  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

/** Suggere le prochain nom de machine libre pour le prefixe fourni (site + type). */
export async function suggestComputerName(prefix: string): Promise<SuggestComputerNameResult> {
  if (process.platform !== 'win32') {
    return {
      ok: false,
      error: "La recherche dans l'Active Directory n'est disponible que sous Windows."
    }
  }

  const upperPrefix = prefix.toUpperCase()
  if (!PREFIX_PATTERN.test(upperPrefix)) {
    return {
      ok: false,
      error: 'Préfixe invalide (lettres et chiffres uniquement, 10 caractères maximum).'
    }
  }

  try {
    const names = await queryComputerNames(upperPrefix)
    return {
      ok: true,
      suggestion: computeNextComputerName(upperPrefix, names),
      existingCount: names.length
    }
  } catch (error) {
    return {
      ok: false,
      error:
        "Impossible d'interroger l'Active Directory (réseau, domaine ou permissions). " +
        'Vérifiez la connexion au réseau de l’entreprise, ou saisissez le nom manuellement. ' +
        `Détail : ${error instanceof Error ? error.message : String(error)}`
    }
  }
}
