# prep-image.ps1 — 블로그 삽입용 사진 전처리: 1:1 중앙 크롭 + 축소 + JPEG 재인코딩
# 사용: powershell -File tools/prep-image.ps1 -In <원본> -Out <출력> [-Size 800] [-Quality 82]
param(
    [Parameter(Mandatory = $true)][string]$In,
    [Parameter(Mandatory = $true)][string]$Out,
    [int]$Size = 800,
    [int]$Quality = 82
)

Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Image]::FromFile((Resolve-Path $In))

# 폰 사진의 EXIF 회전을 실제 픽셀에 반영 (안 하면 크롭이 옆으로 눕는다)
if ($img.PropertyIdList -contains 274) {
    $o = $img.GetPropertyItem(274).Value[0]
    switch ($o) {
        3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
        6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
        8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
    }
    $img.RemovePropertyItem(274)
}

$side = [Math]::Min($img.Width, $img.Height)
$x = [int](($img.Width - $side) / 2)
$y = [int](($img.Height - $side) / 2)
if ($side -lt $Size) { $Size = $side }  # 원본이 더 작으면 업스케일하지 않는다

$bmp = New-Object System.Drawing.Bitmap($Size, $Size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$src = New-Object System.Drawing.Rectangle($x, $y, $side, $side)
$dst = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
$g.DrawImage($img, $dst, $src, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$img.Dispose()

$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)

$outFull = [System.IO.Path]::GetFullPath($Out)
$bmp.Save($outFull, $enc, $ep)
$bmp.Dispose()

$kb = [math]::Round((Get-Item $outFull).Length / 1KB)
Write-Output "$outFull — ${Size}x${Size}, ${kb}KB"
