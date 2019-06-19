import { SVGAttributes } from 'react';

export default (props: SVGAttributes<SVGElement>) => (
  <svg {...props} viewBox="0 0 24 24">
    <path d="M11.293 2.293l-9 9a1 1 0 0 0-.294.707v10.086a.5.5 0 0 0 .5.5h5.997a.5.5 0 0 0 .5-.5v-6.498c0-.554.448-1.002 1.002-1.002h4.004c.553 0 1.002.448 1.002 1.002v6.498a.5.5 0 0 0 .5.5H21.5a.5.5 0 0 0 .5-.5V12a.998.998 0 0 0-.293-.707l-9-9a1 1 0 0 0-1.415 0" />
  </svg>
);