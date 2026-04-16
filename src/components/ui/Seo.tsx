import { Helmet } from "react-helmet-async";
import { seo, type SeoInput } from "@/lib/seo";

export default function Seo(props: SeoInput & { children?: React.ReactNode; schema?: object }) {
  const { title, description, canonical, image, type } = seo(props);
  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type ?? "website"} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {props.schema && (
        <script type="application/ld+json">{JSON.stringify(props.schema)}</script>
      )}
      {props.children}
    </Helmet>
  );
}
