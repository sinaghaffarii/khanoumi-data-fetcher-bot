import axios, { AxiosInstance } from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";

class HttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      logger.debug("HTTP Request", {
        url: config.url,
        method: config.method,
        params: config.params,
      });

      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        logger.debug("HTTP Response", {
          url: response.config.url,
          status: response.status,
        });

        return response;
      },
      (error) => {
        logger.error("HTTP Error", {
          message: error.message,
          url: error.config?.url,
        });

        throw error;
      }
    );
  }

  public get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return this.client.get<T>(url, { params }).then((res) => res.data);
  }
}

export const httpClient = new HttpClient();
