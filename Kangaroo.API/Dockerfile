# ASP.NET Core API Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy csproj and restore
COPY Kangaroo.API/Kangaroo.API.csproj Kangaroo.API/
RUN dotnet restore "Kangaroo.API/Kangaroo.API.csproj"

# copy everything else and publish
COPY . .
WORKDIR /src/Kangaroo.API
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish ./

# install curl for healthchecks
RUN apt-get update \
	&& apt-get install -y curl \
	&& rm -rf /var/lib/apt/lists/*

EXPOSE 8088
ENV ASPNETCORE_URLS=http://0.0.0.0:8088

ENTRYPOINT ["dotnet", "Kangaroo.API.dll"]
