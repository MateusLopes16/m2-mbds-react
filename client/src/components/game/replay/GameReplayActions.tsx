import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import './GameReplayActions.scss';

type GameReplayActionsProps = {
  currentTurnIndex: number;
  totalTurns: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isPlaybackBlocked: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (turnIndex: number) => void;
};

function GameReplayActions({
  currentTurnIndex,
  totalTurns,
  canGoPrevious,
  canGoNext,
  isPlaybackBlocked,
  onPrevious,
  onNext,
  onSeek,
}: GameReplayActionsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dragPointerIdRef = useRef<number | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState(() => {
    if (typeof window === 'undefined') {
      return { x: 24, y: 24 };
    }

    return {
      x: Math.max((window.innerWidth - 400) / 2, 12),
      y: Math.max(window.innerHeight - 130, 12),
    };
  });

  const displayTurn = totalTurns === 0 ? 0 : currentTurnIndex + 1;

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    if (isPlaybackBlocked) {
      return;
    }

    if (!canGoNext) {
      setIsPlaying(false);
      return;
    }

    const intervalId = window.setInterval(() => {
      onNext();
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPlaying, canGoNext, isPlaybackBlocked, onNext]);

  useEffect(() => {
    if (totalTurns === 0) {
      setIsPlaying(false);
    }
  }, [totalTurns]);

  const togglePlay = () => {
    if (totalTurns <= 1) {
      return;
    }

    setIsPlaying((previous) => !previous);
  };

  useEffect(() => {
    const clampPosition = (x: number, y: number) => {
      const panelWidth = panelRef.current?.offsetWidth ?? 400;
      const panelHeight = panelRef.current?.offsetHeight ?? 126;
      const clampedX = Math.min(Math.max(x, 8), Math.max(window.innerWidth - panelWidth - 8, 8));
      const clampedY = Math.min(Math.max(y, 8), Math.max(window.innerHeight - panelHeight - 8, 8));

      return { x: clampedX, y: clampedY };
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging) {
        return;
      }

      const nextX = event.clientX - dragOffsetRef.current.x;
      const nextY = event.clientY - dragOffsetRef.current.y;
      setPosition(clampPosition(nextX, nextY));
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (dragPointerIdRef.current !== event.pointerId) {
        return;
      }

      dragPointerIdRef.current = null;
      setIsDragging(false);
    };

    const handleResize = () => {
      setPosition((previous) => clampPosition(previous.x, previous.y));
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDragging]);

  const onDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!panelRef.current) {
      return;
    }

    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (target?.closest('button, input, select, textarea, a, [data-no-drag="true"]')) {
      return;
    }

    dragPointerIdRef.current = event.pointerId;
    dragOffsetRef.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    };
    setIsDragging(true);
  };

  return (
    <div
      ref={panelRef}
      className={`game-replay-actions ${isDragging ? 'dragging' : ''}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onPointerDown={onDragStart}
    >
      <div className="bar-head">
        <span>Replay controls</span>
      </div>
      <div className="progress-meta">
        <span>
          Turn {displayTurn} / {totalTurns}
        </span>
      </div>
      <div className="progress-row">
        <input
          type="range"
          min={0}
          max={Math.max(totalTurns - 1, 0)}
          step={1}
          value={Math.min(currentTurnIndex, Math.max(totalTurns - 1, 0))}
          onChange={(event) => onSeek(Number(event.target.value))}
          disabled={totalTurns <= 1}
          aria-label="Replay progress"
        />
      </div>
      <div className="actions-row">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          aria-label="Previous turn"
        >
          Prev
        </button>
        <button
          type="button"
          className="play-button"
          onClick={togglePlay}
          disabled={totalTurns <= 1}
          aria-label={isPlaying ? 'Pause replay' : 'Play replay'}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          aria-label="Next turn"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default GameReplayActions;
