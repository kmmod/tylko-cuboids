import Alpine from "alpinejs";
import dropzoneTemplate from "./dropzone.html?raw";
import "./dropzone.css";
import { Api } from "../../api/Api";

const selector = "#dropzone";

export class Dropzone {
  private readonly api: Api;
  constructor(api: Api) {
    this.api = api;
    document.querySelector(selector)!.innerHTML = dropzoneTemplate;
    this.registerComponent();
  }

  private registerComponent(): void {
    const api = this.api;

    Alpine.data("csvDropzone", () => ({
      isDragging: false,
      fileName: "",
      fileSize: 0,
      error: "",

      handleDrop(event: DragEvent) {
        this.isDragging = false;
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
          this.processFile(files[0]);
        }
      },

      handleFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        const files = input.files;
        if (files && files.length > 0) {
          this.processFile(files[0]);
        }
      },

      processFile(file: File) {
        this.error = "";

        if (!file.name.toLowerCase().endsWith(".csv")) {
          this.error = "Please upload a CSV file only.";
          return;
        }

        this.fileName = file.name;
        this.fileSize = file.size;

        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          api.onDataLoaded.emit(text);
        };
        reader.onerror = () => {
          this.error = "Error reading file. Please try again.";
        };
        reader.readAsText(file);
      },

      formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
      },

      clearFile() {
        this.fileName = "";
        this.fileSize = 0;
        this.error = "";
        api.onDataCleared.emit();
      },
    }));
  }
}
