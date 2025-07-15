export const DataScraperService = {
  create: async (prisma, data) => {
    const { name, url } = data;

    if (!name || !url) {
      return {
        success: false,
        status: 400,
        message: "Name and URL are required",
        data: null,
      };
    }

    try {
      const scraped = await prisma.scrapedData.create({
        data: {
          name,
          url,
          type: "GENERAL",
        },
        select: {
          name: true,
          url: true,
        },
      });

      return {
        success: true,
        status: 201,
        message: "Data saved successfully",
        data: scraped,
      };
    } catch (error) {
      // ✅ HANDLE DUPLICATE URL
      if (error.code === "P2002") {
        return {
          success: false,
          status: 409,
          message: "This URL is already stored",
          data: null,
        };
      }

      console.error("Create scrape error:", error);

      return {
        success: false,
        status: 400,
        message: "Failed to save data",
        data: null,
      };
    }
  },

  getAll: async (prisma) => {
    try {
      const data = await prisma.scrapedData.findMany({
        select: {
          name: true,
          url: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        success: true,
        status: 200,
        data,
      };
    } catch (error) {
      return {
        success: false,
        status: 400,
        data: [],
      };
    }
  }, 
  
};
