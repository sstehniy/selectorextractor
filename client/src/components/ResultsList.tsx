import type { VersionedExtractionResult } from "@/types";
import { ResultComponent } from "./ResultComponent";
import { memo } from "react";
import { motion } from "framer-motion";

const propsAreEqual = (
  prevProps: { versionedExtractionResults: VersionedExtractionResult[] },
  nextProps: { versionedExtractionResults: VersionedExtractionResult[] },
) => {
  return (
    prevProps.versionedExtractionResults.length ===
    nextProps.versionedExtractionResults.length
  );
};

export const ResultsList = memo(
  ({
    versionedExtractionResults,
  }: {
    versionedExtractionResults: VersionedExtractionResult[];
  }) => {
    if (versionedExtractionResults.length === 0) {
      return null;
    }
    return (
      <div className="space-y-10 pb-4">
        {versionedExtractionResults.map((versionedResult) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            key={versionedResult.version}
          >
            <ResultComponent versionedResult={versionedResult} />
          </motion.div>
        ))}
      </div>
    );
  },
  propsAreEqual,
);

ResultsList.displayName = "ResultsList";
