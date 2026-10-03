"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { toPng } from "html-to-image";
import JSZip from "jszip";

type Participant = {
  id: number;
  name: string;
};

export default function Home() {
  // --------------------------------
  // TEMPLATE
  // --------------------------------

  const [template, setTemplate] = useState(
    "/certificate-template.png"
  );

  const [templateName, setTemplateName] = useState(
    "Sample Certificate"
  );

  // --------------------------------
  // PARTICIPANTS
  // --------------------------------

  const [participants, setParticipants] = useState<
    Participant[]
  >([]);

  const [selectedParticipant, setSelectedParticipant] =
    useState("");

  // --------------------------------
  // NAME POSITION
  // --------------------------------

  const [namePosition, setNamePosition] = useState({
    x: 50,
    y: 48,
  });

  // --------------------------------
  // NAME APPEARANCE
  // --------------------------------

  const [fontWeight, setFontWeight] =
    useState("700");

  const [fontSize, setFontSize] =
    useState(32);

  const [fontColor, setFontColor] =
    useState("#172554");

  const [fontFamily, setFontFamily] =
    useState("Arial");

  // --------------------------------
  // FILE NAMING
  // --------------------------------

  const [zipFileName, setZipFileName] =
    useState("AITR_Certificates_2026");

  const [certificateFilePrefix, setCertificateFilePrefix] =
    useState("AITR_Certificate");

  // --------------------------------
  // PREVIEW / GENERATION
  // --------------------------------

  const [generatedPreview, setGeneratedPreview] =
    useState<string | null>(null);

  const [isGeneratingPreview, setIsGeneratingPreview] =
    useState(false);

  const [isGeneratingAll, setIsGeneratingAll] =
    useState(false);

  const [generationProgress, setGenerationProgress] =
    useState(0);

  const [generatedCount, setGeneratedCount] =
    useState(0);

  // --------------------------------
  // REFS
  // --------------------------------

  const certificateRef =
    useRef<HTMLDivElement>(null);

  const dragging = useRef(false);

  // --------------------------------
  // SAMPLE TEMPLATE
  // --------------------------------

  function useSampleTemplate() {
    setTemplate("/certificate-template.png");
    setTemplateName("Sample Certificate");
    setGeneratedPreview(null);
  }

  // --------------------------------
  // CUSTOM TEMPLATE
  // --------------------------------

  function handleTemplateUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const imageUrl =
      URL.createObjectURL(file);

    setTemplate(imageUrl);
    setTemplateName(file.name);
    setGeneratedPreview(null);
  }

  // --------------------------------
  // EXCEL / CSV UPLOAD
  // --------------------------------

  function handleParticipantUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;

      if (!data) {
        return;
      }

      const workbook = XLSX.read(data, {
        type: "array",
      });

      const firstSheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      const rows =
        XLSX.utils.sheet_to_json(
          firstSheet,
          {
            header: 1,
            defval: "",
          }
        ) as unknown[][];

      const names = rows
        .flat()
        .map((name) =>
          String(name).trim()
        )
        .filter(
          (name) =>
            name.length > 0
        )
        .filter(
          (name) =>
            name.toLowerCase() !==
            "name"
        );

      const participantList =
        names.map(
          (name, index) => ({
            id: index + 1,
            name,
          })
        );

      setParticipants(
        participantList
      );

      if (
        participantList.length > 0
      ) {
        setSelectedParticipant(
          participantList[0].name
        );
      }

      setGeneratedPreview(null);
      setGenerationProgress(0);
      setGeneratedCount(0);

      // Allow selecting the same Excel
      // file again later.
      event.target.value = "";
    };

    reader.readAsArrayBuffer(file);
  }

  // --------------------------------
  // REMOVE EXCEL
  // --------------------------------

  function removeParticipantFile() {
    setParticipants([]);
    setSelectedParticipant("");
    setGeneratedPreview(null);
    setGenerationProgress(0);
    setGeneratedCount(0);
  }

  // --------------------------------
  // NEW BATCH
  // --------------------------------

  function startNewBatch() {
    setParticipants([]);
    setSelectedParticipant("");
    setGeneratedPreview(null);
    setGenerationProgress(0);
    setGeneratedCount(0);

    // Keep the current certificate
    // template and design settings.
  }

  // --------------------------------
  // DRAG NAME
  // --------------------------------

  function handlePointerDown(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    dragging.current = true;

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  }

  function handlePointerMove(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (!dragging.current) {
      return;
    }

    const certificate =
      certificateRef.current;

    if (!certificate) {
      return;
    }

    const rect =
      certificate.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) /
        rect.width) *
      100;

    const y =
      ((event.clientY - rect.top) /
        rect.height) *
      100;

    setNamePosition({
      x: Math.max(
        5,
        Math.min(95, x)
      ),
      y: Math.max(
        5,
        Math.min(95, y)
      ),
    });
  }

  function handlePointerUp(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    dragging.current = false;

    event.currentTarget.releasePointerCapture(
      event.pointerId
    );
  }

  // --------------------------------
  // RESET POSITION
  // --------------------------------

  function resetPosition() {
    setNamePosition({
      x: 50,
      y: 48,
    });

    setGeneratedPreview(null);
  }

  // --------------------------------
  // SINGLE PREVIEW
  // --------------------------------

  async function generatePreview() {
    if (!certificateRef.current) {
      return;
    }

    if (!selectedParticipant) {
      alert(
        "Please upload an Excel file and select a participant."
      );

      return;
    }

    try {
      setIsGeneratingPreview(true);

      const image =
        await toPng(
          certificateRef.current,
          {
            cacheBust: true,
            pixelRatio: 2,
          }
        );

      setGeneratedPreview(image);
    } catch (error) {
      console.error(
        "Preview generation failed:",
        error
      );

      alert(
        "Could not generate the preview. Please try again."
      );
    } finally {
      setIsGeneratingPreview(false);
    }
  }

  // --------------------------------
  // CLEAN FILE NAME
  // --------------------------------

  function cleanFileName(
    name: string
  ) {
    return name
      .trim()
      .replace(
        /[^a-zA-Z0-9\s-_]/g,
        ""
      )
      .replace(
        /\s+/g,
        "_"
      );
  }

  // --------------------------------
  // BULK GENERATION
  // --------------------------------

  async function generateAllCertificates() {
    if (!certificateRef.current) {
      return;
    }

    if (
      participants.length === 0
    ) {
      alert(
        "Please upload an Excel or CSV file first."
      );

      return;
    }

    const nameElement =
      certificateRef.current.querySelector(
        "[data-certificate-name]"
      ) as HTMLElement | null;

    if (!nameElement) {
      alert(
        "Certificate name element could not be found."
      );

      return;
    }

    try {
      setIsGeneratingAll(true);
      setGenerationProgress(0);
      setGeneratedCount(0);

      const zip = new JSZip();

      const originalName =
        nameElement.textContent || "";

      for (
        let i = 0;
        i < participants.length;
        i++
      ) {
        const participant =
          participants[i];

        nameElement.textContent =
          participant.name;

        await new Promise<void>(
          (resolve) => {
            requestAnimationFrame(
              () => {
                requestAnimationFrame(
                  () => {
                    resolve();
                  }
                );
              }
            );
          }
        );

        const image =
          await toPng(
            certificateRef.current!,
            {
              cacheBust: true,
              pixelRatio: 2,
            }
          );

        const response =
          await fetch(image);

        const blob =
          await response.blob();

        const safeName =
          cleanFileName(
            participant.name
          );

        const safePrefix =
          cleanFileName(
            certificateFilePrefix
          ) ||
          "Certificate";

        const individualFileName =
          `${safePrefix}_${safeName || i + 1}.png`;

        zip.file(
          individualFileName,
          blob
        );

        const completed =
          i + 1;

        setGeneratedCount(
          completed
        );

        setGenerationProgress(
          Math.round(
            (completed /
              participants.length) *
              100
          )
        );
      }

      nameElement.textContent =
        originalName;

      const zipBlob =
        await zip.generateAsync(
          {
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: {
              level: 6,
            },
          }
        );

      const downloadUrl =
        URL.createObjectURL(
          zipBlob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href =
        downloadUrl;

      const safeZipName =
        cleanFileName(
          zipFileName
        ) ||
        "Certificates";

      link.download =
        `${safeZipName}.zip`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      URL.revokeObjectURL(
        downloadUrl
      );
    } catch (error) {
      console.error(
        "Bulk generation failed:",
        error
      );

      alert(
        "Something went wrong while generating the certificates."
      );
    } finally {
      setIsGeneratingAll(false);
    }
  }

  // --------------------------------
  // UI
  // --------------------------------

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-10 text-center">

          <h1 className="text-4xl font-bold text-gray-900">
            Bulk Certificate Generator
          </h1>

          <p className="mt-3 text-gray-600">
            Upload a certificate template,
            import participant names,
            customize the certificate,
            and generate certificates
            in bulk.
          </p>

        </div>

        {/* TEMPLATE CARD */}

        <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          <div className="mb-6">

            <h2 className="text-xl font-semibold text-gray-900">
              Certificate Template
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Use the sample certificate
              or upload your own
              certificate design.
            </p>

          </div>

          {/* TEMPLATE OPTIONS */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <button
              type="button"
              onClick={
                useSampleTemplate
              }
              className="rounded-xl border border-gray-300 bg-white p-5 text-left transition hover:border-blue-500 hover:bg-blue-50"
            >

              <p className="font-semibold text-gray-900">
                Use Sample Template
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Use the certificate
                provided with this
                application.
              </p>

            </button>

            <label className="cursor-pointer rounded-xl border border-gray-300 bg-white p-5 text-left transition hover:border-blue-500 hover:bg-blue-50">

              <p className="font-semibold text-gray-900">
                Upload Your Own
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Upload your own JPG
                or PNG certificate.
              </p>

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={
                  handleTemplateUpload
                }
                className="mt-4 block w-full cursor-pointer text-sm text-gray-600"
              />

            </label>

          </div>

          {/* CURRENT TEMPLATE */}

          <div className="mt-5 rounded-lg bg-gray-50 px-4 py-3">

            <p className="text-sm text-gray-500">
              Current template
            </p>

            <p className="mt-1 truncate font-medium text-gray-900">
              {templateName}
            </p>

          </div>

          {/* CERTIFICATE EDITOR */}

          <div className="mt-8">

            <div
              ref={certificateRef}
              className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm select-none"
            >

              <img
                src={template}
                alt="Certificate template"
                className="block h-auto w-full"
                draggable={false}
              />

              {selectedParticipant && (
                <div
                  data-certificate-name
                  onPointerDown={
                    handlePointerDown
                  }
                  onPointerMove={
                    handlePointerMove
                  }
                  onPointerUp={
                    handlePointerUp
                  }
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-grab select-none active:cursor-grabbing"
                  style={{
                    left:
                      `${namePosition.x}%`,
                    top:
                      `${namePosition.y}%`,
                    fontSize:
                      `${fontSize}px`,
                    fontWeight:
                      fontWeight as
                        | "400"
                        | "500"
                        | "600"
                        | "700"
                        | "800",
                    fontFamily,
                    color:
                      fontColor,
                    background:
                      "transparent",
                    whiteSpace:
                      "nowrap",
                    textShadow:
                      "0 1px 2px rgba(0,0,0,0.12)",
                  }}
                >
                  {
                    selectedParticipant
                  }
                </div>
              )}

            </div>

          </div>

          {/* POSITION */}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">

            <div>

              <p className="font-medium text-gray-900">
                Name Position
              </p>

              <p className="text-sm text-gray-500">
                Drag the name on the
                certificate to set its
                exact position.
              </p>

            </div>

            <button
              type="button"
              onClick={
                resetPosition
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Reset Position
            </button>

          </div>

          {/* NAME APPEARANCE */}

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5">

            <h3 className="mb-4 text-base font-semibold text-gray-900">
              Name Appearance
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

              {/* FONT FAMILY */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Font Family
                </label>

                <select
                  value={
                    fontFamily
                  }
                  onChange={
                    (event) =>
                      setFontFamily(
                        event.target.value
                      )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >

                  <option value="Arial">
                    Arial
                  </option>

                  <option value="Georgia">
                    Georgia
                  </option>

                  <option value="Times New Roman">
                    Times New Roman
                  </option>

                  <option value="Verdana">
                    Verdana
                  </option>

                  <option value="Trebuchet MS">
                    Trebuchet MS
                  </option>

                </select>

              </div>

              {/* FONT WEIGHT */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Font Weight
                </label>

                <select
                  value={
                    fontWeight
                  }
                  onChange={
                    (event) =>
                      setFontWeight(
                        event.target.value
                      )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >

                  <option value="400">
                    Regular
                  </option>

                  <option value="500">
                    Medium
                  </option>

                  <option value="600">
                    Semi Bold
                  </option>

                  <option value="700">
                    Bold
                  </option>

                  <option value="800">
                    Extra Bold
                  </option>

                </select>

              </div>

              {/* FONT SIZE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Font Size
                </label>

                <select
                  value={
                    fontSize
                  }
                  onChange={
                    (event) =>
                      setFontSize(
                        Number(
                          event.target
                            .value
                        )
                      )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >

                  <option value="24">
                    Small — 24px
                  </option>

                  <option value="28">
                    Medium — 28px
                  </option>

                  <option value="32">
                    Large — 32px
                  </option>

                  <option value="36">
                    Extra Large — 36px
                  </option>

                  <option value="42">
                    Huge — 42px
                  </option>

                </select>

              </div>

              {/* TEXT COLOR */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Text Color
                </label>

                <div className="flex h-[43px] items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 shadow-sm">

                  <input
                    type="color"
                    value={
                      fontColor
                    }
                    onChange={
                      (event) =>
                        setFontColor(
                          event.target
                            .value
                        )
                    }
                    className="h-7 w-10 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
                    title="Choose text color"
                  />

                  <span className="text-sm font-semibold text-gray-800">
                    {
                      fontColor.toUpperCase()
                    }
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* BACKGROUND INFO */}

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">

            <p className="font-medium text-gray-900">
              Name Background
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Transparent — the
              certificate design remains
              visible behind the name.
            </p>

          </div>

          {/* PREVIEW BUTTON */}

          <div className="mt-6 flex justify-center">

            <button
              type="button"
              onClick={
                generatePreview
              }
              disabled={
                isGeneratingPreview ||
                !selectedParticipant
              }
              className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {isGeneratingPreview
                ? "Generating Preview..."
                : "Generate Preview"}

            </button>

          </div>

        </section>

        {/* GENERATED PREVIEW */}

        {generatedPreview && (
          <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

            <h2 className="text-xl font-semibold text-gray-900">
              Generated Preview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Final certificate preview.
            </p>

            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-4">

              <img
                src={
                  generatedPreview
                }
                alt="Generated certificate"
                className="mx-auto w-full max-w-5xl"
              />

            </div>

          </section>
        )}

        {/* PARTICIPANTS */}

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          <div className="flex flex-wrap items-start justify-between gap-4">

            <div>

              <h2 className="text-xl font-semibold text-gray-900">
                Participant Names
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Upload a CSV or Excel file
                containing participant
                names.
              </p>

            </div>

            {participants.length > 0 && (
              <button
                type="button"
                onClick={
                  removeParticipantFile
                }
                className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Remove Excel
              </button>
            )}

          </div>

          {/* EXCEL UPLOAD */}

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={
              handleParticipantUpload
            }
            className="mt-6 block w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-700"
          />

          {/* PARTICIPANT LIST */}

          {participants.length > 0 && (
            <div className="mt-8">

              <div className="mb-3 flex items-center justify-between">

                <h3 className="font-semibold text-gray-900">
                  Participant List
                </h3>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  {
                    participants.length
                  }{" "}
                  names
                </span>

              </div>

              {/* PREVIEW PARTICIPANT */}

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Preview Participant
              </label>

              <select
                value={
                  selectedParticipant
                }
                onChange={
                  (event) => {
                    setSelectedParticipant(
                      event.target
                        .value
                    );

                    setGeneratedPreview(
                      null
                    );
                  }
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >

                {participants.map(
                  (
                    participant
                  ) => (
                    <option
                      key={
                        participant.id
                      }
                      value={
                        participant.name
                      }
                    >
                      {
                        participant.name
                      }
                    </option>
                  )
                )}

              </select>

              {/* NAME LIST */}

              <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">

                {participants.map(
                  (
                    participant
                  ) => (
                    <div
                      key={
                        participant.id
                      }
                      className="flex items-center border-b border-gray-200 px-4 py-3 last:border-b-0"
                    >

                      <span className="mr-4 w-8 text-sm text-gray-400">
                        {
                          participant.id
                        }
                      </span>

                      <span className="text-gray-800">
                        {
                          participant.name
                        }
                      </span>

                    </div>
                  )
                )}

              </div>

              {/* FILE NAMING */}

              <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6">

                <h3 className="text-lg font-semibold text-gray-900">
                  File Naming
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Set the naming format once.
                  Participant names will
                  automatically come from
                  your Excel file.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* ZIP NAME */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-800">
                      ZIP File Name
                    </label>

                    <div className="flex items-center rounded-lg border border-gray-300 bg-white">

                      <input
                        type="text"
                        value={
                          zipFileName
                        }
                        onChange={
                          (event) =>
                            setZipFileName(
                              event
                                .target
                                .value
                            )
                        }
                        className="w-full rounded-lg bg-transparent px-4 py-3 text-sm font-medium text-gray-900 outline-none"
                        placeholder="AITR_Certificates_2026"
                      />

                      <span className="pr-4 text-sm font-medium text-gray-500">
                        .zip
                      </span>

                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      Example:{" "}
                      <span className="font-medium">
                        AITR_Certificates_2026.zip
                      </span>
                    </p>

                  </div>

                  {/* INDIVIDUAL PREFIX */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-800">
                      Certificate File Prefix
                    </label>

                    <input
                      type="text"
                      value={
                        certificateFilePrefix
                      }
                      onChange={
                        (event) =>
                          setCertificateFilePrefix(
                            event
                              .target
                              .value
                          )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      placeholder="AITR_Certificate"
                    />

                    <p className="mt-2 text-xs text-gray-500">
                      Final format:{" "}
                      <span className="font-medium">
                        {certificateFilePrefix ||
                          "AITR_Certificate"}
                        _ParticipantName.png
                      </span>
                    </p>

                  </div>

                </div>

              </div>

              {/* BULK GENERATION */}

              <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-6">

                <h3 className="text-lg font-semibold text-gray-900">
                  Generate Certificates
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  Generate a certificate for
                  every participant in your
                  uploaded file.
                </p>

                {/* PROGRESS */}

                {isGeneratingAll && (
                  <div className="mt-6">

                    <div className="mb-2 flex justify-between text-sm">

                      <span className="font-medium text-gray-700">
                        Generating certificates...
                      </span>

                      <span className="font-semibold text-gray-900">
                        {
                          generatedCount
                        }{" "}
                        /{" "}
                        {
                          participants.length
                        }
                      </span>

                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-gray-200">

                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-200"
                        style={{
                          width:
                            `${generationProgress}%`,
                        }}
                      />

                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                      {
                        generationProgress
                      }
                      % complete
                    </p>

                  </div>
                )}

                {/* GENERATE ALL */}

                <button
                  type="button"
                  onClick={
                    generateAllCertificates
                  }
                  disabled={
                    isGeneratingAll ||
                    participants.length ===
                      0
                  }
                  className="mt-6 w-full rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {isGeneratingAll
                    ? `Generating ${generatedCount} / ${participants.length}...`
                    : `Generate All ${participants.length} Certificates`}

                </button>

                {!isGeneratingAll &&
                  generatedCount > 0 &&
                  generationProgress ===
                    100 && (
                    <p className="mt-4 text-center text-sm font-medium text-green-700">
                      ✓ All certificates
                      generated and ZIP
                      download started.
                    </p>
                  )}

              </div>

              {/* NEW BATCH */}

              <div className="mt-5 flex justify-end">

                <button
                  type="button"
                  onClick={
                    startNewBatch
                  }
                  disabled={
                    isGeneratingAll
                  }
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Start New Batch
                </button>

              </div>

            </div>
          )}

        </section>

      </div>

    </main>
  );
}