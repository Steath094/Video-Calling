// steath094/video-calling/Video-Calling-b947e446079ab3de02b610912125e5b3868cb778/client/src/react-player.d.ts
declare module 'react-player' {
  import * as React from 'react';

  export interface ReactPlayerProps {
    url?: string | string[] | MediaStream | undefined;
    playing?: boolean;
    loop?: boolean;
    controls?: boolean;
    light?: boolean | string;
    volume?: number;
    muted?: boolean;
    playbackRate?: number;
    width?: string | number;
    height?: string | number;
    style?: React.CSSProperties;
    progressInterval?: number;
    playsinline?: boolean;
    pip?: boolean;
    stopOnUnmount?: boolean;
    fallback?: React.ReactElement;
    wrapper?: React.ElementType;
    onReady?: (player: ReactPlayer) => void;
    onStart?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onBuffer?: () => void;
    onBufferEnd?: () => void;
    onEnded?: () => void;
    onError?: (error: any, data?: any, hlsInstance?: any, hlsGlobal?: any) => void;
    onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
    [otherProps: string]: any;
  }

  export default class ReactPlayer extends React.Component<ReactPlayerProps> {}
}