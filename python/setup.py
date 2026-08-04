from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="feedo-sdk",
    version="0.1.5",
    description="The official Developer SDK for Feedo Network",
    long_description=long_description,
    long_description_content_type="text/markdown",
    license="Apache-2.0",
    author="Feedo Network",
    packages=find_packages(),
    install_requires=[
        "httpx>=0.24.0",
    ],
    python_requires=">=3.8",
)
