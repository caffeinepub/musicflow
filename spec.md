# MusicFlow

## Current State
Nuevo proyecto sin código existente.

## Requested Changes (Diff)

### Add
- Reproductor de música completo con controles (play, pause, siguiente, anterior, volumen, barra de progreso)
- Biblioteca de canciones con canciones de ejemplo (sample content habilitado)
- Contador de reproducciones por canción
- Estadísticas: canciones más reproducidas y total de horas escuchadas
- Sistema de favoritos (marcar/desmarcar canciones)
- Letras sincronizadas que se resaltan en tiempo real según el progreso de la canción
- Vistas: Biblioteca, Más Reproducidas, Favoritos, Estadísticas

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend Motoko:
   - Entidad `Song`: id, title, artist, duration, audioUrl, lyrics (array de {time, text})
   - Entidad `PlayRecord`: songId, playCount, totalSecondsListened
   - Entidad `UserStats`: totalSecondsListened
   - Operaciones: getSongs, getSong, recordPlay, toggleFavorite, getFavorites, getTopPlayed, getStats
2. Frontend React:
   - Reproductor de audio con Web Audio API / HTML5 Audio
   - Componente de letras sincronizadas (highlight por timestamp)
   - Vista biblioteca con lista de canciones
   - Vista estadísticas (top reproducidas, horas totales)
   - Vista favoritos
   - Mini-player persistente en la parte inferior
