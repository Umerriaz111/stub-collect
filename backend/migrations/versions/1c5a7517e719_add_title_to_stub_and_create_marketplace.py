"""add title to stub and create marketplace

Revision ID: 1c5a7517e719
Revises: 99e9e3fa814a
Create Date: 2024-03-21 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1c5a7517e719'
down_revision = '99e9e3fa814a'
branch_labels = None
depends_on = None


def upgrade():
    # First add the title column as nullable
    with op.batch_alter_table('stub', schema=None) as batch_op:
        batch_op.add_column(sa.Column('title', sa.String(255), nullable=True))

    # Update existing records to use event_name as title
    connection = op.get_bind()
    connection.execute(sa.text(
        "UPDATE stub SET title = COALESCE(event_name, 'Untitled Stub') WHERE title IS NULL"
    ))

    # Now make the title column not nullable
    with op.batch_alter_table('stub', schema=None) as batch_op:
        batch_op.alter_column('title',
               existing_type=sa.String(255),
               nullable=False)

    # Create stub_listing table
    op.create_table('stub_listing',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('stub_id', sa.Integer(), nullable=False),
        sa.Column('seller_id', sa.Integer(), nullable=False),
        sa.Column('asking_price', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(3), nullable=False, default='USD'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, default='active'),
        sa.Column('listed_at', sa.DateTime(), nullable=False, default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('sold_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['seller_id'], ['user.id'], ),
        sa.ForeignKeyConstraint(['stub_id'], ['stub.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    # Drop the stub_listing table
    op.drop_table('stub_listing')
    
    # Remove the title column from stub table
    with op.batch_alter_table('stub', schema=None) as batch_op:
        batch_op.drop_column('title')
