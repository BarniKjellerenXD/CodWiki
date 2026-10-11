# Research-only snapshots. No application assets or datasets are changed.
$ErrorActionPreference = 'Stop'
$researchRoot = $PSScriptRoot
$repoApi = 'https://api.github.com/repos/Miss-placed/DECLASSIFIED'
$commit = (Invoke-RestMethod ($repoApi + '/commits/master')).sha
$tree = (Invoke-RestMethod ($repoApi + '/git/trees/' + $commit + '?recursive=1')).tree
$paths = @($tree | Where-Object { $_.path -match '^public/legacy/maps/.+\.svg$' } | ForEach-Object path)
$paths += @('LICENSE', 'public/legacy/LICENSE', 'README.md', 'src/data/maps/blackOps6Maps.tsx', 'src/data/maps/coldWarMaps.tsx', 'src/data/maps/coldWarOutbreakMaps.tsx', 'src/data/maps/sharedSVGProperties.tsx', 'src/data/maps/mapDetails.tsx')
$records = foreach ($sourcePath in $paths) {
    $localRelative = 'assets/declassified/' + $sourcePath
    $destination = Join-Path $researchRoot $localRelative
    New-Item -ItemType Directory -Force -Path (Split-Path $destination) | Out-Null
    $url = 'https://raw.githubusercontent.com/Miss-placed/DECLASSIFIED/' + $commit + '/' + $sourcePath
    Invoke-WebRequest -Uri $url -OutFile $destination
    [pscustomobject]@{
        path = $localRelative; sourceUrl = $url; bytes = (Get-Item -LiteralPath $destination).Length
        sha256 = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash.ToLowerInvariant()
        kind = if ($sourcePath -match '\.svg$') { 'vector-layout-reference' } elseif ($sourcePath -match '\.tsx$') { 'vector-source-reference-not-executed' } else { 'provenance' }
    }
}
[pscustomobject]@{
    reviewed = '2026-10-11'; repository = 'https://github.com/Miss-placed/DECLASSIFIED'; commit = $commit
    purpose = 'Research snapshots only. Not imported into CodWiki. SVG/JSX require visual and geographic QA; preserve license notices and review underlying game-art provenance before publication.'
    license = 'Repository MIT: 2024 Odinn H & Ben Ashley; legacy MIT: 2021 Odinn H. Notices preserved beside sources.'
    files = @($records)
} | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $researchRoot 'downloaded-assets.json') -Encoding utf8
Write-Output ('Saved ' + $records.Count + ' research files at source commit ' + $commit)
