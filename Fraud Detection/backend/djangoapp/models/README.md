# Model artifacts

The trained classifier used by the ETL commands lives here by default:

```
random_forest.pkl
```

**The file is not in version control** (`*.pkl` is git-ignored) because it is a
build artifact, not source.

## How to get it

Run `fraud-detection.ipynb` at the repository root. Its final cell saves the
model:

```python
save_model(trained_model, "random_forest.pkl")
```

The notebook was authored on Kaggle and reads
`/kaggle/input/transactions-data/transaction_data.csv`, so adjust its paths to
run locally.

## Pointing the app at it

`settings.FRAUD_MODEL_PATH` defaults to `<djangoapp>/models/random_forest.pkl`.
Override it with the `FRAUD_MODEL_PATH` environment variable if you keep the
model elsewhere.
